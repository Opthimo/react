// MenuConfig.js
import MicIcon from './icons/mic-icon.svg';
import ThordIcon from './icons/thord-icon.png';
import MIDIIcon from './icons/midi-icon.svg';
import PianoIcon from './icons/piano.svg';
import KINECTIcon from './icons/ponpon.svg';
import TreeIcon from './icons/tree_icon.svg';
import BluetoothIcon from './icons/bluetooth.svg';
import GearIcon from './icons/gear.svg';


export const menuItems = [
  { icon: MicIcon, label: 'Thing', path: '/thinging', requiresBLE: false, requiresKinect: false },
  { icon: ThordIcon, label: 'Thord', path: '/thord', requiresBLE: true, requiresKinect: false },
  { icon: MIDIIcon, label: 'MIDI', path: '/midi', requiresBLE: true, requiresKinect: false },
  { icon: PianoIcon, label: 'Notenregen', path: '/notenregen', requiresBLE: false, requiresKinect: true },
  { icon: KINECTIcon, label: 'Thwing', path: '/kinect', requiresBLE: false, requiresKinect: true },
  { icon: TreeIcon, label: 'Tree', path: '/tree', requiresBLE: false, requiresKinect: false },
  { icon: PianoIcon, label: 'Thession', path: '/thession', requiresBLE: true, requiresKinect: true },
  { icon: ThordIcon, label: 'BLE 3D', path: '/ble3d', requiresBLE: true, requiresKinect: false },
  { icon: BluetoothIcon, label: 'Files', path: '/file', requiresBLE: false, requiresKinect: false },
  { icon: BluetoothIcon, label: 'chat', path: '/chat', requiresBLE: false, requiresKinect: false },
  { icon: BluetoothIcon, label: 'move', path: '/move', requiresBLE: false, requiresKinect: false },
  { icon: MIDIIcon, label: 'MIDI Route', path: '/midiroute', requiresBLE: false, requiresKinect: false },
  { icon: GearIcon, label: 'Einstellungen', path: '/preferences', requiresBLE: false, requiresKinect: false },
  { icon: GearIcon, label: 'Babylon', path: '/babylon', requiresBLE: false, requiresKinect: false },
  { icon: GearIcon, label: 'Thpace', path: '/thpace', requiresBLE: false, requiresKinect: false }
];