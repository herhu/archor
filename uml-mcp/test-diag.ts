
import { generateUseCaseDiagram } from './src/transform/mermaid.js';

const mockSpec = {
  domains: [
    {
      name: 'Auth',
      modules: [],
      services: [
        {
          name: 'Auth',
          operations: [
             { name: 'login', method: 'POST', path: '/login', authz: { required: false } },
             { name: 'register', method: 'POST', path: '/register', authz: { required: false } }
          ]
        }
      ],
      entities: []
    }
  ]
};

console.log("--- Generated Diagram ---");
// @ts-ignore
const diagram = generateUseCaseDiagram(mockSpec);
console.log(diagram);
console.log("-------------------------");
console.log("Encoded JSON:", JSON.stringify({ diagram }));
