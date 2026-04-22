// Avatar images for use across vibes/projects.
// Source: 300x300 PNGs extracted from the Cash App Lite iOS asset catalog.
//
// Usage:
//   import { ariel, avatars, type AvatarName } from '@/assets/images/avatars';
//   <img src={ariel} alt="Ariel" />
//   <img src={avatars['beth']} alt="Beth" />

import ariel from './ariel.png';
import beth from './beth.png';
import cam from './cam.png';
import carolina from './carolina.png';
import cheryl from './cheryl.png';
import darren from './darren.png';
import eric from './eric.png';
import isabel from './isabel.png';
import jack from './jack.png';
import jeremy from './jeremy.png';
import katherine from './katherine.png';
import louise from './louise.png';
import meylin from './meylin.png';
import michael from './michael.png';
import miles from './miles.png';
import monique from './monique.png';
import nina from './nina.png';
import paul from './paul.png';
import sharda from './sharda.png';
import vanessa from './vanessa.png';
import will from './will.png';
import zach from './zach.png';
import zoe from './zoe.png';

export {
  ariel, beth, cam, carolina, cheryl, darren, eric, isabel, jack, jeremy,
  katherine, louise, meylin, michael, miles, monique, nina, paul, sharda,
  vanessa, will, zach, zoe,
};

export const avatars = {
  ariel, beth, cam, carolina, cheryl, darren, eric, isabel, jack, jeremy,
  katherine, louise, meylin, michael, miles, monique, nina, paul, sharda,
  vanessa, will, zach, zoe,
} as const;

export type AvatarName = keyof typeof avatars;

export const avatarNames: AvatarName[] = Object.keys(avatars) as AvatarName[];
