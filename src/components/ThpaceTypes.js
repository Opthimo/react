// ThpaceTypes.js

export const LAYOUT_TYPES = {
    LINE: 'line',
    SEMICIRCLE: 'semicircle',
    ARC: 'arc'
  };
  
  // JSDoc für bessere IDE-Unterstützung
  /**
   * @typedef {Object} ThpaceSettings
   * @property {('line'|'semicircle'|'arc')} layout
   * @property {number} angle
   * @property {number|'auto'} radius
   * @property {boolean} useRainbow
   * @property {boolean} useUniqueNotes
   * @property {string} noteColor
   * @property {string} backgroundColor
   * @property {number} noteSpeed
   * @property {number} noteSize
   */
  
  export const DEFAULT_SETTINGS = {
    layout: LAYOUT_TYPES.LINE,
    angle: 180,
    radius: 'auto',
    useRainbow: true,
    useUniqueNotes: false,
    noteColor: '#ff0000',
    backgroundColor: '#000000',
    noteSpeed: 0.05,
    noteSize: 0.1
  };