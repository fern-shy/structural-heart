export type Slide =
  | { id: string; type: 'image'; uri: string; caption?: string }
  | { id: string; type: 'video'; uri: string; caption?: string; isLoop?: boolean };


