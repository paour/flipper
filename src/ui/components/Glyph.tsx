/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import React from 'react';
import styled from 'react-emotion';
import PropTypes from 'prop-types';
import {getIconURL} from '../../utils/icons.js';

export type IconSize = 8 | 10 | 12 | 16 | 18 | 20 | 24 | 32;

const ColoredIconBlack = styled('img')(({size}: {size: number}) => ({
  height: size,
  verticalAlign: 'middle',
  width: size,
  flexShrink: 0,
}));
ColoredIconBlack.displayName = 'Glyph:ColoredIconBlack';

const ColoredIconCustom = styled('div')(
  (props: {size: number; color?: string; src: string}) => ({
    height: props.size,
    verticalAlign: 'middle',
    width: props.size,
    backgroundColor: props.color,
    display: 'inline-block',
    maskImage: `url('${props.src}')`,
    maskSize: '100% 100%',
    WebkitMaskImage: `url('${props.src}')`,
    WebkitMaskSize: '100% 100%',
    flexShrink: 0,
  }),
);
ColoredIconCustom.displayName = 'Glyph:ColoredIconCustom';

function ColoredIcon(
  props: {
    name: string;
    src: string;
    size?: number;
    className?: string;
    color?: string;
    style?: React.CSSProperties;
  },
  context: {
    glyphColor?: string;
  },
) {
  const {color = context.glyphColor, name, size = 16, src, style} = props;

  const isBlack =
    color == null ||
    color === '#000' ||
    color === 'black' ||
    color === '#000000';

  if (isBlack) {
    return (
      <ColoredIconBlack
        alt={name}
        src={src}
        size={size}
        className={props.className}
        style={style}
      />
    );
  } else {
    return (
      <ColoredIconCustom
        color={color}
        size={size}
        src={src}
        className={props.className}
        style={style}
      />
    );
  }
}
ColoredIcon.displayName = 'Glyph:ColoredIcon';
ColoredIcon.contextTypes = {
  glyphColor: PropTypes.string,
};

export default class Glyph extends React.PureComponent<{
  name: string;
  size?: IconSize;
  variant?: 'filled' | 'outline';
  className?: string;
  color?: string;
  style?: React.CSSProperties;
  title?: string;
}> {
  render() {
    const {name, size = 16, variant, color, className, style} = this.props;

    return (
      <ColoredIcon
        name={name}
        className={className}
        color={color}
        size={size}
        src={getIconURL(
          variant === 'outline' ? `${name}-outline` : name,
          size,
          typeof window !== 'undefined' ? window.devicePixelRatio : 1,
        )}
        style={style}
      />
    );
  }
}
