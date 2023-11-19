(async () => {
  const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const CHUNK_SIZE = 5;

  for (let i = 0; i < 10; i += CHUNK_SIZE) {
    console.log(a.slice(i, i + CHUNK_SIZE));
  }
  console.log('123');
})();
