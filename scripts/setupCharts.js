import Chart from 'chart.js/auto';
import { sigfig, humanFileSize, dateFormatter } from './formatters.js';

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


const setupCharts = () => {
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
          /*
          if (i === arr.length - 1) {
            requestPercentCached[date] /= requestCount[date];
          }
          */
        })

        Object.keys(site.totals).forEach((dataPointKey) => {
          if (!dataTotals[dataPointKey]) dataTotals[dataPointKey] = 0;

          dataTotals[dataPointKey] += site.totals[dataPointKey]
        })
      })

      //i used to do this on the last site in the loop, but the occasional edge case (missing date for a domain) would result in some data being malformed
      Object.keys(requestPercentCached).forEach((date) => {
        if (!requestCount[date]) return;
        requestPercentCached[date] /= requestCount[date];
      })

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
      document.getElementById('analyticsLoadingMessage').innerText = 'Past 30 Days via Cloudflare Analytics'
    })
    .catch(e => { //ye olde error catching
      console.error(e)

      //putting the error text on the default text element
      document.getElementById('analyticsLoadingMessage').innerText = 'There was an error loading the infrastructure analytics. Please try again later.';
    })
};

export default setupCharts;