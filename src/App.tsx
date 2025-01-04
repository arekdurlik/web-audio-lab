import { useEffect, useState } from 'react'
import { FlowEditor } from './components/FlowEditor'
import { ReactFlowProvider, useReactFlow } from 'reactflow'
import { Navbar } from './components/ui/Navbar'
import { Sidebar } from './components/ui/Sidebar'
import { FlowWrapper, Fullscreen, GlobalStyle } from './styled'
import { useFlowStore } from './stores/flowStore'
import { useSettingsStore } from './stores/settingsStore'

function Style() {
  const editMode = useFlowStore(state => state.editMode)
  const zoom = useFlowStore(state => state.zoom)

  return <GlobalStyle editMode={editMode} scale={zoom.toString()} />
}

function App() {
  return (
    <Fullscreen>
      <ReactFlowProvider>
        <Navbar />
        <Style />
        <FlowWrapper>
          <Sidebar />
          <FlowEditor />
        </FlowWrapper>
      </ReactFlowProvider>
    </Fullscreen>
  )
}

export default App


