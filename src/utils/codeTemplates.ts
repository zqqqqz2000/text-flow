import { KeyofProcessWarpFuncMap } from "./flowProcessor";

export const defaultSplit = `// split function for text source
(str) => {
  return str.split('\\n');
}`;

export const defaultMap = `// map function for text source
(item) => {
  return item;
}`;

export const defaultReduce = `// reduce function for text source
(acc, item) => {
  return acc + item;
}`;

export const defaultFilter = `// filter function for text source
(item) => {
  return true;
}`;

export const defaultProcess = `// process function for text source
(args) => {
  return args;
}`;

export const defaultCodeMap: {
  [key in KeyofProcessWarpFuncMap]: string | undefined;
} = {
  map: defaultMap,
  reduce: defaultReduce,
  filter: defaultFilter,
  input: undefined,
  join: undefined,
  process: defaultProcess,
  writer: undefined,
}
