
# Visual Foxpro Outline

Outline for Visual Foxpro 

## Features

- Procedure & Function definitions with parameters
- Return Values

## Change Log

1.0.2
- return statements w/o values shown correctly
- added detection of abbreviated procedure & function names ( proc , func )
  const regex = /^[ \t]*(PROCEDURE|FUNCTION|DEFINE CLASS|RETURN)[ \t]+([^\r\n]+)/gim;
- source code available on github
  