declare module '*.png' {
  const value: number;
  export default value;
}

declare module '*.jpg' {
  const value: number;
  export default value;
}

declare module '*.json' {
  const value: {name: string; displayName?: string};
  export default value;
}
