export type Slide =
  | { id: string; type: 'image'; uri: string; caption?: string }
  | { id: string; type: 'video'; uri: string; caption?: string; isLoop?: boolean }
  | { id: string; type: 'text'; title: string; content: string }
  /** A slide saved with missing or unrecognised data; shown as an apology with a Report button. */
  | { id: string; type: 'unavailable'; reason: string };


