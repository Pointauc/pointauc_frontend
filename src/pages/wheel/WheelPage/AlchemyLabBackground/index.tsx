import styles from './index.module.css';

const AlchemyLabBackground = () => {
  return (
    <div className={styles.root}>
      {/* Magical ambient overlay */}
      <div className={styles.magicalOverlay}></div>

      {/* Bookshelf silhouettes */}
      <div className={`${styles.bookshelf} ${styles.leftBookshelf}`}></div>
      <div className={`${styles.bookshelf} ${styles.rightBookshelf}`}></div>

      {/* Glowing bottles on shelves */}
      <div className={`${styles.glowingBottle} ${styles.bottle1}`}></div>
      <div className={`${styles.glowingBottle} ${styles.bottle2}`}></div>
      <div className={`${styles.glowingBottle} ${styles.bottle3}`}></div>
      <div className={`${styles.glowingBottle} ${styles.bottle4}`}></div>
      <div className={`${styles.glowingBottle} ${styles.bottle5}`}></div>

      {/* Magical circles and runes */}
      <div className={`${styles.magicalCircle} ${styles.circle1}`}></div>
      <div className={`${styles.magicalCircle} ${styles.circle2}`}></div>
      <div className={`${styles.magicalCircle} ${styles.circle3}`}></div>

      {/* Pulsing magical energy points */}
      <div className={`${styles.magicalPulse} ${styles.pulse1}`}></div>
      <div className={`${styles.magicalPulse} ${styles.pulse2}`}></div>
      <div className={`${styles.magicalPulse} ${styles.pulse3}`}></div>

      {/* Floating scrolls and maps */}
      <div className={`${styles.floatingScroll} ${styles.scroll1}`}></div>
      <div className={`${styles.floatingScroll} ${styles.scroll2}`}></div>
      <div className={`${styles.floatingScroll} ${styles.scroll3}`}></div>

      {/* Magical particles */}
      <div className={`${styles.particle} ${styles.particle1}`}></div>
      <div className={`${styles.particle} ${styles.particle2}`}></div>
      <div className={`${styles.particle} ${styles.particle3}`}></div>
      <div className={`${styles.particle} ${styles.particle4}`}></div>
      <div className={`${styles.particle} ${styles.particle5}`}></div>

      {/* Crystalline formations */}
      <div className={`${styles.crystal} ${styles.crystal1}`}></div>
      <div className={`${styles.crystal} ${styles.crystal2}`}></div>
      <div className={`${styles.crystal} ${styles.crystal3}`}></div>
      <div className={`${styles.crystal} ${styles.crystal4}`}></div>

      {/* Candle flame effects */}
      <div className={`${styles.candleFlame} ${styles.flame1}`}></div>
      <div className={`${styles.candleFlame} ${styles.flame2}`}></div>
      <div className={`${styles.candleFlame} ${styles.flame3}`}></div>

      {/* Arcane symbols */}
      <div className={`${styles.arcaneSymbol} ${styles.symbol1}`}></div>
      <div className={`${styles.arcaneSymbol} ${styles.symbol2}`}></div>
      <div className={`${styles.arcaneSymbol} ${styles.symbol3}`}></div>
      <div className={`${styles.arcaneSymbol} ${styles.symbol4}`}></div>

      {/* Light motes */}
      <div className={`${styles.lightMote} ${styles.mote1}`}></div>
      <div className={`${styles.lightMote} ${styles.mote2}`}></div>
      <div className={`${styles.lightMote} ${styles.mote3}`}></div>
      <div className={`${styles.lightMote} ${styles.mote4}`}></div>
      <div className={`${styles.lightMote} ${styles.mote5}`}></div>
    </div>
  );
};

export default AlchemyLabBackground;
