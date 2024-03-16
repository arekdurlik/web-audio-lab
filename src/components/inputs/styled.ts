import styled from 'styled-components'
import { FlexContainer } from '../../styled'
import SVG from 'react-inlinesvg'

export const InputWrapper = styled.div`
flex-direction: column;
gap: 1px;
justify-content: space-between;
`

export const InputLabel = styled.span`
display: block;
margin-left: 2px;
margin-right: 2px;
padding: 2px;
`

export const ParamInput = styled.input`
border: 1px solid #000;
border-radius: 0;
margin-top: 5px;
outline: none;
`
export const Select = styled.select`
border-radius: 0;
outline: none;
`

export const Slider = styled.input`
margin-top: 15px;
margin-bottom: 15px;
-webkit-appearance: none;
width: 135px;
height: 1px;
background: #000;
outline: none;
opacity: 1;
-webkit-transition: .2s;
transition: opacity .2s;

&:hover {
  ::-webkit-slider-thumb {
    background-color: #000;
  }
}
::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 15px;
  background: #999;
  cursor: pointer;
  border-radius: 0;
}

::-moz-range-thumb {
  width: 25px;
  height: 25px;
  background: #000;
  cursor: pointer;
}
`

export const ExpandableInputLabel = styled(InputLabel)<{ $expanded?: boolean}>`
padding-left: 2px;
padding-right: 2px;
display: flex;
justify-content: space-between;
${({ $expanded }) => $expanded !== undefined && `
&:hover {
  background-color: lightgray;
  cursor: pointer;
}
`}
`
export const ExpandableInputWrapper = styled(InputWrapper)`
flex: 1;
`
export const ExpandableInputContainer = styled(FlexContainer)`
margin: 0 5px;
margin-bottom: 4px;
`
export const Triangle = styled(SVG)<{ $expanded?: boolean }>`
width: 7px;
margin-left: 2px;
margin-right: 2px;
rotate: 180deg;

${({ $expanded }) => $expanded && 'rotate: 0deg;' }
`

export const ExpandableInputContent = styled.div<{ $expanded?: boolean }>`
${({ $expanded }) => !$expanded && `
height: 0;
overflow: hidden;`}
`