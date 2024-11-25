// Reference the audio element
const chime = document.getElementById('chime');

// Create an EventSource to connect to the SSE endpoint
const eventSource = new EventSource('/events');

// Chart initialization
const gyroCtx = document.getElementById('gyroChart').getContext('2d');
const accelCtx = document.getElementById('accelChart').getContext('2d');

const gyroChart = new Chart(gyroCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      { label: 'Gyro X', data: [], borderColor: 'red', fill: false },
      { label: 'Gyro Y', data: [], borderColor: 'green', fill: false },
      { label: 'Gyro Z', data: [], borderColor: 'blue', fill: false }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

const accelChart = new Chart(accelCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      { label: 'Accel X', data: [], borderColor: 'red', fill: false },
      { label: 'Accel Y', data: [], borderColor: 'green', fill: false },
      { label: 'Accel Z', data: [], borderColor: 'blue', fill: false }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

function getLocalTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
}

// Function to update chart data
function updateChartData(chart, dataX, dataY, dataZ) {
  const label = getLocalTime(); // Get formatted time for label
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(dataX);
  chart.data.datasets[1].data.push(dataY);
  chart.data.datasets[2].data.push(dataZ);
  chart.update();
}

// Function to handle chart click
function maximizeChart(originalChart) {
  // Show the modal
  const modal = document.getElementById('chartModal');
  modal.style.display = 'block';

  // Get the context of the modal's canvas
  const modalCtx = document.getElementById('modalChart').getContext('2d');

  // Destroy any existing chart in the modal to prevent duplication
  if (window.modalChartInstance) {
    window.modalChartInstance.destroy();
  }

  // Clone the data and options from the original chart
  const clonedData = JSON.parse(JSON.stringify(originalChart.data));
  const clonedOptions = JSON.parse(JSON.stringify(originalChart.options));

  // Create a new chart in the modal
  window.modalChartInstance = new Chart(modalCtx, {
    type: originalChart.config.type,
    data: clonedData,
    options: clonedOptions,
  });

  // Close modal when 'X' is clicked
  document.querySelector('.close').onclick = function() {
    modal.style.display = 'none';
  };

  // Close modal when clicking outside the modal content
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
}

// Add event listeners to charts
document.getElementById('gyroChart').onclick = function() {
  maximizeChart(gyroChart);
};

document.getElementById('accelChart').onclick = function() {
  maximizeChart(accelChart);
};

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received data:', data);

  // Update the dashboard
  document.getElementById('stepCount').textContent = data.stepCount;
  document.getElementById('distance').textContent = parseFloat(data.distance).toFixed(2);
  document.getElementById('caloriesBurned').textContent = parseFloat(data.caloriesBurned).toFixed(2);
  document.getElementById('accelX').textContent = parseFloat(data.accelX).toFixed(2);
  document.getElementById('accelY').textContent = parseFloat(data.accelY).toFixed(2);
  document.getElementById('accelZ').textContent = parseFloat(data.accelZ).toFixed(2);
  document.getElementById('gyroX').textContent = parseFloat(data.gyroX).toFixed(2);
  document.getElementById('gyroY').textContent = parseFloat(data.gyroY).toFixed(2);
  document.getElementById('gyroZ').textContent = parseFloat(data.gyroZ).toFixed(2);

  // Update charts
  updateChartData(gyroChart, data.gyroX, data.gyroY, data.gyroZ);
  updateChartData(accelChart, data.accelX, data.accelY, data.accelZ);

  // Show notification if fallDetected is true and play chime
  if (data.fallDetected) {
    document.getElementById('notification').style.display = 'block';
    chime.play(); // Play the chime when the alert is shown
  } else {
    document.getElementById('notification').style.display = 'none';
  }
};

eventSource.onerror = function(err) {
  console.error('EventSource failed:', err);
};
