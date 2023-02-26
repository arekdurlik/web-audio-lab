import styled from 'styled-components'

export const ParamInput = styled.input`
border: 1px solid #000;
border-radius: 0;
margin-top: 5px;
outline: none;
`
export const Select = styled.select`
border: 1px solid #000;
border-radius: 0;
margin-top: 5px;
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