function encode() {
  const file = document.getElementById('encode-image').files[0];
  const message = document.getElementById('message').value;

  if (!file || !message) return alert("Please select an image and enter a message.");

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.getElementById('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;

      const msgBits = messageToBits(message + '\0');

      if (msgBits.length > pixels.length / 4) {
        alert("Message is too long!");
        return;
      }

      for (let i = 0, j = 0; j < msgBits.length; i += 4, j++) {
        pixels[i] = (pixels[i] & 0xFE) | msgBits[j];
      }

      ctx.putImageData(imgData, 0, 0);
      document.getElementById('download').href = canvas.toDataURL();
      document.getElementById('download').style.display = 'inline';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function decode() {
  const file = document.getElementById('decode-image').files[0];
  if (!file) return alert("Please select an image.");

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.getElementById('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;

      let bits = [];
      for (let i = 0; i < pixels.length; i += 4) {
        bits.push(pixels[i] & 1);
      }

      const chars = [];
      for (let i = 0; i < bits.length; i += 8) {
        const byte = bits.slice(i, i + 8).reduce((acc, b, j) => acc | (b << (7 - j)), 0);
        if (byte === 0) break;
        chars.push(String.fromCharCode(byte));
      }

      document.getElementById('decoded-message').value = chars.join('');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function messageToBits(msg) {
  const bits = [];
  for (let i = 0; i < msg.length; i++) {
    const code = msg.charCodeAt(i);
    for (let j = 7; j >= 0; j--) {
      bits.push((code >> j) & 1);
    }
  }
  return bits;
}
const backgroundAudio = document.getElementById('backgroundAudio');
backgroundAudio.addEventListener('ended', () => {
  backgroundAudio.currentTime = 0;
  backgroundAudio.play();
});
