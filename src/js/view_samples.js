   document.getElementById('fetchData').addEventListener('click', function() {
        const sampleID = document.getElementById('sampleID').value;
        const evaluatedId = document.getElementById('evaluatedId').value;
        const testTypeId = document.getElementById('testTypeId').value;

        fetch(`http://localhost:8080/hardware_controller/sample?sampleID=${sampleID}&evaluatedId=${evaluatedId}&testTypeId=${testTypeId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const rawData = data.rawData.sensors;
                const sensor1Data = rawData.sensor1;
                const sensor2Data = rawData.sensor2;

                // Prepare data for Sensor 1
                const sensor1Samples = Object.values(sensor1Data);
                const sensor1Ax = sensor1Samples.map(sample => sample.ax);
                const sensor1Ay = sensor1Samples.map(sample => sample.ay);
                const sensor1Az = sensor1Samples.map(sample => sample.az);
                const sensor1Gx = sensor1Samples.map(sample => sample.gx);
                const sensor1Gy = sensor1Samples.map(sample => sample.gy);
                const sensor1Gz = sensor1Samples.map(sample => sample.gz);
                
                // Prepare data for Sensor 2
                const sensor2Samples = Object.values(sensor2Data);
                const sensor2Ax = sensor2Samples.map(sample => sample.ax);
                const sensor2Ay = sensor2Samples.map(sample => sample.ay);
                const sensor2Az = sensor2Samples.map(sample => sample.az);
                const sensor2Gx = sensor2Samples.map(sample => sample.gx);
                const sensor2Gy = sensor2Samples.map(sample => sample.gy);
                const sensor2Gz = sensor2Samples.map(sample => sample.gz);

                // Clear existing charts if they exist
                clearCharts();

                // Create charts
                createChart('sensor1Chart', 'Sensor 1 Acceleration', sensor1Ax, sensor1Ay, sensor1Az, sensor1Gx, sensor1Gy, sensor1Gz);
                createChart('sensor2Chart', 'Sensor 2 Acceleration', sensor2Ax, sensor2Ay, sensor2Az, sensor2Gx, sensor2Gy, sensor2Gz);
            })
            .catch(error => console.error('Error fetching data:', error));
    });

    function createChart(chartId, label, axData, ayData, azData, gxData, gyData, gzData) {
        const ctx = document.getElementById(chartId).getContext('2d');

        // Create dynamic labels based on the length of the data
        const sampleCount = axData.length;
        const labels = Array.from({ length: sampleCount }, (_, i) => `Sample ${i + 1}`);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels, // Use dynamic labels here
                datasets: [
                    {
                        label: `${label} - Ax`,
                        data: axData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: `${label} - Ay`,
                        data: ayData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: `${label} - Az`,
                        data: azData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: `${label} - Gx`,
                        data: gxData,
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: `${label} - Gy`,
                        data: gyData,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: `${label} - Gz`,
                        data: gzData,
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function clearCharts() {
        const ctx1 = document.getElementById('sensor1Chart').getContext('2d');
        ctx1.clearRect(0, 0, ctx1.canvas.width, ctx1.canvas.height);
        const ctx2 = document.getElementById('sensor2Chart').getContext('2d');
        ctx2.clearRect(0, 0, ctx2.canvas.width, ctx2.canvas.height);
    }