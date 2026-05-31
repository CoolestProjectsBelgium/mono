declare module 'bcrypt' {
  export function compareSync(data: string, encrypted: string): boolean;
}