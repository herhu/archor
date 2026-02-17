
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { db } from '../db/index.js';
import { s3Service } from '../services/s3.js';

export const generationInterceptor = {
  isTargetTool(method: string) {
    return method === 'tools/call' || method === 'call_tool'; // Adjust based on actual protocol method
  },

  isGenerateProject(params: any) {
      return params?.name === 'archon_generate_project';
  },

  async handleGenerateProject(params: any, userId: string, pool: any, authContext: any) {
    // 1. Setup Generation Context
    const generationId = uuidv4();
    const tempDir = path.join('/tmp', 'archon', generationId);
    
    // 2. Extract and Capture Spec
    // Tool params: { name: "archon_generate_project", arguments: { spec: ..., outDir: ... } }
    // Or if using the SDK client structure, params might be the arguments directly if the router unpacks it.
    // Let's assume params here is `{ name: "archon_generate_project", arguments: { ... } }`
    
    const toolArgs = params.arguments;
    const spec = toolArgs.spec;
    const { zipKey, specKey } = s3Service.getKeys(userId, generationId);

    // 3. Create DB Record (Running)
    await db.none(`
      INSERT INTO generations (id, user_id, spec_s3_key, zip_s3_key, status, created_at, meta)
      VALUES ($1, $2, $3, $4, 'running', NOW(), $5)
    `, [generationId, userId, specKey, zipKey, { specName: spec?.name }]);

    try {
      // 4. Prepare Temp Dir
      await fs.ensureDir(tempDir);
      
      // 5. Modify Args to use Temp Dir
      const modifiedArgs = { ...toolArgs, outDir: tempDir };

      // 6. Execute Tool via Pool
      // We need to call the pool dispatch logic. 
      // Since we are inside the route handler, we might need to invoke the pool differently or just let the caller do it if we return the modified args.
      // However, the interceptor is best placed to wrap the entire lifecycle including post-processing.
      
      const startTime = Date.now();
      const result = await pool.dispatch(
        authContext,
        'tools/call', // Standard MCP method
        { name: 'archon_generate_project', arguments: modifiedArgs }
      );
      const durationMs = Date.now() - startTime;

      // 7. Post-Processing: Spec Upload & Zip Stream
      
      // Upload Spec (JSON)
      await s3Service.uploadJson(specKey, spec);
      
      // Zip and Stream Upload
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.directory(tempDir, false);
      archive.finalize();

      // Upload the archive stream directly
      await s3Service.uploadStream(zipKey, archive, 'application/zip');
      
      // Get sizes for observability (optional, extra calls)
      // const zipMeta = await s3Service.headObject(zipKey);
      // const specMeta = await s3Service.headObject(specKey);

      // 8. Update DB (Success)
      await db.none(`
        UPDATE generations 
        SET status = 'success', duration_ms = $1
        WHERE id = $2
      `, [durationMs, generationId]);

      // 9. Cleanup
      await fs.remove(tempDir);

      // 10. Return Enhanced Result
      // We append the download links to the tool output
      const zipUrl = await s3Service.getPresignedUrl(zipKey);
      const specUrl = await s3Service.getPresignedUrl(specKey);

      return {
        content: [
          { 
            type: 'text', 
            text: `Project generated successfully!\n\nID: ${generationId}\n\n[Download ZIP](${zipUrl})\n[Download Spec](${specUrl})` 
          }
        ],
        _meta: { generationId, zipUrl, specUrl } // Internal meta if needed
      };

    } catch (error: any) {
      console.error("Generation Failed:", error);
      
      // Update DB (Error)
      await db.none(`
        UPDATE generations 
        SET status = 'error', error = $1
        WHERE id = $2
      `, [error.message, generationId]);

      // Cleanup
      await fs.remove(tempDir).catch(() => {});

      throw error; // Re-throw to show error to user
    }
  }
};
