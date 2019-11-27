import React, { useRef, useContext, useImperativeHandle } from "react";

import MarkdownWrapper from "./style/MarkdownWrapper";
import { CellContext } from "../../stores/CellStore";
import { useCellState } from "../../utils/";

const ListCell = React.forwardRef(({ cellUuid }, ref) => {
  const { state } = useContext(CellContext);
  const { text, placeholder } = useCellState(state, cellUuid);
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    },
  }));

  return (
    <MarkdownWrapper
      as="li"
      placeholder={placeholder}
      // onKeyDown={keyDownHandler}
      // onKeyPress={onKeyPress}
      // onBlur={blurHandler}
      ref={inputRef || null}
      suppressContentEditableWarning
      contentEditable
    >
      {text}
    </MarkdownWrapper>
  );
});

export default ListCell;
