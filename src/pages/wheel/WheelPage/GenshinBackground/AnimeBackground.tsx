import styles from './AnimeBackground.module.css';

const AnimeBackground = () => {
  return (
    <div className={styles.root}>
      {/* Star field with twinkling effect */}
      <div className={styles.starField}></div>

      {/* Constellation patterns */}
      <div className={styles.constellations}></div>

      {/* Aurora effects */}
      <div className={styles.aurora}></div>

      {/* Mountain silhouettes */}
      <div className={styles.mountains}></div>

      {/* Floating islands */}
      <div className={styles.floatingIslands}>
        <div className={styles.island}></div>
        <div className={styles.island}></div>
        <div className={styles.island}></div>
      </div>

      {/* Elemental particles */}
      <div className={styles.particles}>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
        <div className={styles.particle}></div>
      </div>
    </div>
  );
};

export default AnimeBackground;
