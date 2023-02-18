import { useEffect, useState } from 'react'
import { FlowEditor } from './components/FlowEditor'
import { FlowWrapper, Fullscreen, GlobalStyle } from './styled'
import { ReactFlowProvider, useReactFlow } from 'reactflow'
import { Navbar } from './components/ui/Navbar'
import { Sidebar } from './components/ui/Sidebar'

function App() {
  return (
    <Fullscreen>
      <ReactFlowProvider>
        <Navbar />
        <GlobalStyle />
        <FlowWrapper>
          <Sidebar />
          <FlowEditor />
        </FlowWrapper>
      </ReactFlowProvider>
    </Fullscreen>
  )
}

export default App


