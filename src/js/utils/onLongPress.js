export const onLongPress = (element, callback, interval) => {
  let timer;

  element.addEventListener('pointerdown', (e) => {
    timer = setTimeout(() => {
      timer = null;
      callback(e);
    }, interval);
  });

  function cancel() {
    clearTimeout(timer);
  }

  element.addEventListener('pointerup', cancel);
  element.addEventListener('pointermove', cancel);
};