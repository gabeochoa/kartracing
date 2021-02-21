const mybezier = {
  bquad: (a, b, c, t) => {
    const ab = p5.Vector.lerp(a, b, t);
    const bc = p5.Vector.lerp(b, c, t);
    return p5.Vector.lerp(ab, bc, t);
  },
  bcube: (a, b, c, d, t) => {
    const abc = mybezier.bquad(a, b, c, t);
    const bcd = mybezier.bquad(b, c, d, t);
    return p5.Vector.lerp(abc, bcd, t);
  }
};
