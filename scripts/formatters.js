//https://stackoverflow.com/questions/25416635/display-number-with-significant-figures-and-k-m-b-t-suffix-in-javascript
export const sigfig = (num, sigfigs_opt) => {
  // Set default sigfigs to 3
  sigfigs_opt = (typeof sigfigs_opt === "undefined") ? 3 : sigfigs_opt;
  // Only assigns sig figs and suffixes for numbers > 1
  if (num <= 1) return num.toPrecision(sigfigs_opt);
  // Calculate for numbers > 1
  var power10 = Math.log10(num);
  var power10ceiling = Math.floor(power10) + 1;
  // 0 = '', 1 = 'K', 2 = 'M', 3 = 'B', 4 = 'T'
  var SUFFIXES = ['', 'K', 'M', 'B', 'T'];
  // 100: power10 = 2, suffixNum = 0, suffix = ''
  // 1000: power10 = 3, suffixNum = 1, suffix = 'K'
  var suffixNum = Math.floor(power10 / 3);
  var suffix = SUFFIXES[suffixNum];
  // Would be 1 for '', 1000 for 'K', 1000000 for 'M', etc.
  var suffixPower10 = Math.pow(10, suffixNum * 3);
  var base = num / suffixPower10;
  var baseRound = base.toPrecision(sigfigs_opt);
  return baseRound + suffix;
}

//https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
export const humanFileSize = (bytes, si = false, dp = 1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
}

export const dateFormatter = new Intl.DateTimeFormat([], {
  month: 'short',
  day: 'numeric',
});