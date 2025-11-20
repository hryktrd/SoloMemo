import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Simple test component
function TestApp() {
    return (
        <div className="min-h-screen bg-blue-500 flex items-center justify-center">
            <h1 className="text-4xl text-white">SoloMemo Test</h1>
        </div>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TestApp />
    </StrictMode>,
)
