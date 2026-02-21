// --- Auth & Init ---
async function init() {
    try {
        const res = await fetch('/v1/me');
        if (res.status === 401) {
            showLogin();
        } else if (!res.ok) {
            throw new Error('Auth check failed');
        } else {
            const data = await res.json();
            if (data.email) {
                showDashboard(data);
            } else {
                showLogin();
            }
        }
    } catch (e) {
        console.error("Init error:", e);
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('loginPrompt').classList.remove('hidden');
}

function showDashboard(user) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('dashboardContent').classList.remove('hidden');
    document.getElementById('userMenu').classList.remove('hidden');
    document.getElementById('emailDisplay').textContent = user.email;

    // Initial Data Fetch
    fetchKeys();
    fetchGenerations();
}

async function logout() {
    await fetch('/auth/logout', { method: 'POST' });
    window.location.reload();
}

// --- Keys Management ---
async function fetchKeys() {
    try {
        const res = await fetch('/v1/keys');
        const keys = await res.json();

        document.getElementById('statActiveKeys').textContent = keys.filter(k => k.status === 'active').length;

        const tbody = document.getElementById('keysTable');
        tbody.innerHTML = '';

        keys.forEach(key => {
            const isActive = key.status === 'active';
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-800/30 transition-colors';
            tr.innerHTML = `
                <td class="table-cell font-mono text-slate-400">${key.prefix}...</td>
                <td class="table-cell">
                    <span class="status-badge ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}">
                        ${isActive ? 'Active' : 'Revoked'}
                    </span>
                </td>
                <td class="table-cell text-slate-500">${new Date(key.created_at).toLocaleDateString()}</td>
                <td class="table-cell">
                    ${isActive ? `<button onclick="revokeKey('${key.id}')" class="btn-danger">Revoke</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) { console.error("Fetch keys error:", e); }
}

async function createKey() {
    const res = await fetch('/v1/keys', { method: 'POST' });
    const data = await res.json();
    document.getElementById('newKeyAlert').classList.remove('hidden');
    document.getElementById('newKeyToken').textContent = data.apiKey;
    fetchKeys();
}

function copyKey() {
    const key = document.getElementById('newKeyToken').textContent;
    navigator.clipboard.writeText(key);
    alert("Copied to clipboard!");
}

async function revokeKey(id) {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    await fetch(`/v1/keys/${id}`, { method: 'DELETE' });
    fetchKeys();
}

// --- Generations ---
async function fetchGenerations() {
    const tbody = document.getElementById('generationsTable');
    const emptyState = document.getElementById('genEmptyState');
    const errorState = document.getElementById('genErrorState');

    try {
        // tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-slate-500">Loading...</td></tr>';
        errorState.classList.add('hidden');

        const res = await fetch('/v1/generations');
        if (!res.ok) throw new Error('Failed to fetch');

        const gens = await res.json();
        const statTotalGen = document.getElementById('statTotalGen');
        if (statTotalGen) statTotalGen.textContent = gens.length;

        tbody.innerHTML = '';

        if (gens.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');

        gens.forEach(gen => {
            const date = new Date(gen.created_at).toLocaleString();
            const duration = gen.duration_ms ? `${(gen.duration_ms / 1000).toFixed(1)}s` : '-';
            const isSuccess = gen.status === 'success';
            const isError = gen.status === 'error';

            // Meta handling
            const specName = gen.meta?.specName || 'Untitled Project';

            let statusHtml = '';
            if (isSuccess) statusHtml = `<span class="status-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Success</span>`;
            else if (isError) statusHtml = `<span class="status-badge bg-red-500/10 text-red-400 border border-red-500/20" title="${gen.error}">Error</span>`;
            else statusHtml = `<span class="status-badge bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">Running</span>`;

            let actionsHtml = '';
            if (isSuccess) {
                actionsHtml = `
                    <div class="flex justify-end gap-2">
                        <button onclick="openDiagram('${gen.id}')" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm transition-colors flex items-center gap-1">
                            <span class="opacity-50">♦</span> Diagrams
                        </button>
                        <a href="/v1/generations/${gen.id}/spec" target="_blank" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm transition-colors flex items-center gap-1">
                            <span class="opacity-50">{}</span> Spec
                        </a>
                        <a href="/v1/generations/${gen.id}/download" target="_blank" class="px-3 py-1.5 bg-archon-600 hover:bg-archon-500 text-white rounded-md text-sm transition-colors font-medium flex items-center gap-1 shadow-lg shadow-archon-900/20">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download ZIP
                        </a>
                    </div>
                `;
            } else if (isError) {
                actionsHtml = `<span class="text-xs text-red-400 truncate max-w-[200px] block" title="${gen.error}">${gen.error || 'Unknown error'}</span>`;
            }

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-800/30 transition-colors group';
            tr.innerHTML = `
                <td class="table-cell">
                    <div class="flex flex-col">
                        <span class="font-medium text-white">${specName}</span>
                        <span class="text-xs text-slate-500 font-mono">${gen.id}</span>
                    </div>
                </td>
                <td class="table-cell">${statusHtml}</td>
                <td class="table-cell text-slate-500">${date}</td>
                <td class="table-cell text-slate-500 font-mono text-xs">${duration}</td>
                <td class="table-cell text-right">${actionsHtml}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (e) {
        console.error("Fetch generations error:", e);
        errorState.classList.remove('hidden');
        // tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-400">Failed to load generations.</td></tr>';
    }
}

// --- Diagrams ---
let currentGenId = null;
let currentSpec = null;

async function openDiagram(genId) {
    currentGenId = genId;
    currentSpec = null; // Clear cache
    
    const modal = document.getElementById('diagramModal');
    if (!modal) return;

    // Force visibility
    modal.classList.remove('hidden');
    modal.style.display = 'flex'; 
    modal.style.zIndex = '9999'; // Ensure on top

    // Mark default tab
    document.querySelectorAll('.diagram-tab').forEach(t => t.classList.remove('active', 'text-white', 'bg-slate-700'));
    const defaultTab = document.querySelector('.diagram-tab[data-type="model"]');
    if (defaultTab) {
        defaultTab.classList.add('active', 'text-white', 'bg-slate-700');
        defaultTab.classList.remove('text-slate-400', 'hover:bg-slate-800');
    }

    // Small delay to allow modal to render before mermaid logic runs
    setTimeout(() => {
        loadDiagram('model');
    }, 50);
}

function closeDiagramModal() {
    document.getElementById('diagramModal').classList.add('hidden');
    document.getElementById('mermaidContainer').innerHTML = '';
}

function switchDiagram(type) {
    // Update tabs
    document.querySelectorAll('.diagram-tab').forEach(t => {
        t.classList.remove('active', 'text-white', 'bg-slate-700');
        t.classList.add('text-slate-400', 'hover:bg-slate-800');
    });
    const tab = document.querySelector(`.diagram-tab[data-type="${type}"]`);
    if (tab) {
        tab.classList.add('active', 'text-white', 'bg-slate-700');
        tab.classList.remove('text-slate-400', 'hover:bg-slate-800');
    }

    loadDiagram(type);
}

async function loadDiagram(type) {
    const container = document.getElementById('mermaidContainer');
    const loading = document.getElementById('diagramLoading');
    const errorDiv = document.getElementById('diagramError');
    const errorMsg = document.getElementById('diagramErrorMsg');

    loading.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    container.innerHTML = ''; // Clear previous

    try {
        // 1. Fetch Spec if needed
        if (!currentSpec) {
            const resSpec = await fetch(`/v1/generations/${currentGenId}/spec`);
            if (!resSpec.ok) throw new Error("Failed to fetch project spec");
            currentSpec = await resSpec.json();
        }

        // 2. Generate Diagram
        const resDiagram = await fetch('/v1/generations/diagram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spec: currentSpec, type })
        });

        if (!resDiagram.ok) {
            const err = await resDiagram.json();
            throw new Error(err.error || "Failed to generate diagram");
        }

        const data = await resDiagram.json();
        console.log("DEBUG DIAGRAM:", JSON.stringify(data.diagram));

        // 3. Render Mermaid
        // Generate unique ID for mermaid to avoid conflicts
        const id = `mermaid-${Date.now()}`;
        
        // Ensure mermaid is initialized
        if (window.mermaid) {
            try {
                // Returns { svg }
                const { svg } = await window.mermaid.render(id, data.diagram);
                container.innerHTML = svg;

                // Add Pan/Zoom
                const svgElement = container.querySelector('svg');
                if (svgElement) {
                    // Maximum dimensions to ensure it fits but is zoomable
                    svgElement.style.width = '100%';
                    svgElement.style.height = '100%';
                    
                    // Small delay to ensure DOM is ready
                    setTimeout(() => {
                        window.panZoomInstance = svgPanZoom(svgElement, {
                            zoomEnabled: true,
                            controlIconsEnabled: true,
                            fit: true,
                            center: true,
                            minZoom: 0.1,
                            maxZoom: 10
                        });
                    }, 100);
                }

            } catch (renderError) {
                console.error("Mermaid Render Error:", renderError);
                throw new Error("Failed to render diagram syntax: " + renderError.message);
            }
        } else {
             throw new Error("Mermaid library not loaded");
        }

    } catch (e) {
        console.error("Diagram error details:", e);
        errorDiv.classList.remove('hidden');
        errorMsg.textContent = e.message;
    } finally {
        loading.classList.add('hidden');
    }
}


// --- Spec Editor ---
function editSpec() {
    if (!currentSpec) return;
    const editor = document.getElementById('specEditor');
    editor.value = JSON.stringify(currentSpec, null, 2);
    document.getElementById('specModal').classList.remove('hidden');
}

function closeSpecModal() {
    document.getElementById('specModal').classList.add('hidden');
}

async function saveAndGenerate() {
    const editor = document.getElementById('specEditor');
    const spinner = document.getElementById('saveSpinner');

    try {
        const newSpec = JSON.parse(editor.value);

        // Confirm
        if (!confirm(`Generate new version of "${newSpec.name || 'Project'}"?`)) return;

        spinner.classList.remove('hidden');

        const res = await fetch('/v1/generations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spec: newSpec })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to trigger generation");
        }

        alert("Generation started! You will see it in the list shortly.");
        closeSpecModal();
        closeDiagramModal();
        fetchGenerations(); // Refresh list

    } catch (e) {
        alert("Error: " + e.message);
    } finally {
        spinner.classList.add('hidden');
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);
