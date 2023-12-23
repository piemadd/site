import Chart from 'chart.js/auto';

const mainSection = document.getElementById('mainSection');
const topLinks = document.getElementById('topLinks');

//code for "back to top"

//initial load
if (mainSection.scrollTop > 0) topLinks.style.opacity = '1';
else topLinks.style.opacity = '0';

//whenever user scrolls
mainSection.addEventListener("scroll", (event) => {
  if (event.target.scrollTop > 0) topLinks.style.opacity = '1';
  else topLinks.style.opacity = '0';
});

//https://stackoverflow.com/questions/25416635/display-number-with-significant-figures-and-k-m-b-t-suffix-in-javascript
const sigfig = (num, sigfigs_opt) => {
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
const humanFileSize = (bytes, si = false, dp = 1) => {
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

const dateFormatter = new Intl.DateTimeFormat([], {
  month: 'short',
  day: 'numeric',
})

const chartOptions = {
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        title: (context) => {
          return dateFormatter.format(new Date(context[0].label))
        },
        label: (context) => {
          return sigfig(context.raw)
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        display: false
      }
    },
    y: {
      min: 0,
      ticks: {
        display: false
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  }
};

//getting site analytics
fetch('https://store.piemadd.com/cfa')
  .then(res => res.json()) //need me some json
  .then(data => {
    let userCount = {};
    let requestCount = {};
    let requestPercentCached = {};
    let dataServed = {};
    let dataCached = {};

    let dataTotals = {
      domains: 0,
    };

    Object.values(data).forEach((site, i, arr) => {
      dataTotals.domains += 1;

      Object.keys(site.dates).forEach((date) => {
        //first site, so we know the dates wont be set yet
        if (i === 0) {
          userCount[date] = 0;
          requestCount[date] = 0;
          requestPercentCached[date] = 0;
          dataServed[date] = 0;
          dataCached[date] = 0;
        }

        userCount[date] += site.dates[date].users;
        requestCount[date] += site.dates[date].requests;
        requestPercentCached[date] += site.dates[date].cachedRequests;
        dataServed[date] += site.dates[date].bytes;
        dataCached[date] += site.dates[date].cachedBytes;

        //last site, so we can make the cached percent an actual percent
        if (i === arr.length - 1) {
          requestPercentCached[date] /= requestCount[date];
        }
      })

      Object.keys(site.totals).forEach((dataPointKey) => {
        if (!dataTotals[dataPointKey]) dataTotals[dataPointKey] = 0;

        dataTotals[dataPointKey] += site.totals[dataPointKey]
      })
    })

    console.log(userCount)
    console.log(requestCount)
    console.log(requestPercentCached)
    console.log(dataServed)
    console.log(dataCached);
    console.log(dataTotals)

    //setting top numbers
    document.getElementById('totalUsers').innerText = sigfig(dataTotals.users);
    document.getElementById('totalRequests').innerText = sigfig(dataTotals.requests);
    document.getElementById('overallPercentCached').innerText = (dataTotals.cachedRequests * 100 / dataTotals.requests).toFixed(2) + '%';
    document.getElementById('totalDataServed').innerText = humanFileSize(dataTotals.bytes, true);
    document.getElementById('totalDataCached').innerText = humanFileSize(dataTotals.cachedBytes, true);

    //users
    new Chart(
      document.getElementById('userCount'),
      {
        type: 'line',
        options: chartOptions,
        data: {
          labels: Object.keys(userCount),
          datasets: [
            {
              data: Object.keys(userCount).map(date => userCount[date]),
              fill: true,
            }
          ]
        }
      }
    );

    //requests
    new Chart(
      document.getElementById('requestCount'),
      {
        type: 'line',
        options: chartOptions,
        data: {
          labels: Object.keys(requestCount),
          datasets: [
            {
              data: Object.keys(requestCount).map(date => requestCount[date]),
              fill: true,
            }
          ]
        }
      }
    );

    //percent cached
    new Chart(
      document.getElementById('requestPercentCached'),
      {
        type: 'line',
        options: {
          ...chartOptions,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return (context.raw * 100).toFixed(2) + '%'
                }
              }
            }
          },
        },
        data: {
          labels: Object.keys(requestPercentCached),
          datasets: [
            {
              data: Object.keys(requestPercentCached).map(date => requestPercentCached[date]),
              fill: true,
            }
          ]
        }
      }
    );

    //data served
    new Chart(
      document.getElementById('dataServed'),
      {
        type: 'line',
        options: {
          ...chartOptions,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return humanFileSize(context.raw, true)
                }
              }
            }
          },
        },
        data: {
          labels: Object.keys(dataServed),
          datasets: [
            {
              data: Object.keys(dataServed).map(date => dataServed[date]),
              fill: true,
            }
          ]
        }
      }
    );

    //data cached
    new Chart(
      document.getElementById('dataCached'),
      {
        type: 'line',
        options: {
          ...chartOptions,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return humanFileSize(context.raw, true)
                }
              }
            }
          },
        },
        data: {
          labels: Object.keys(dataCached),
          datasets: [
            {
              data: Object.keys(dataCached).map(date => dataCached[date]),
              fill: true,
            }
          ]
        }
      }
    );

    //replace the loading message
    document.getElementById('analyticsLoadingMessage').innerText = 'Past 30 Days'
  })
  .catch(e => { //ye olde error catching
    console.error(e)

    //putting the error text on the default text element
    document.getElementById('analyticsLoadingMessage').innerText = 'There was an error loading the infrastructure analytics. Please try again later.';
  })