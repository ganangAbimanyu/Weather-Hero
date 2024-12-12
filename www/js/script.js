$(document).ready(function () {
    const apiKey = 'e8ad06a85ef6224c030db64b17662e7a'; // Replace with your API key

    const weatherIcons = {
        clear: 'bi-brightness-high',
        clouds: 'bi-cloud',
        rain: 'bi-cloud-rain',
        drizzle: 'bi-cloud-drizzle',
        thunderstorm: 'bi-cloud-lightning',
        snow: 'bi-snow',
        mist: 'bi-water',
    };

    function getWeatherIcon(description) {
        const lowerDesc = description.toLowerCase();
        if (lowerDesc.includes('clear')) return weatherIcons.clear;
        if (lowerDesc.includes('cloud')) return weatherIcons.clouds;
        if (lowerDesc.includes('rain')) return weatherIcons.rain;
        if (lowerDesc.includes('drizzle')) return weatherIcons.drizzle;
        if (lowerDesc.includes('thunderstorm')) return weatherIcons.thunderstorm;
        if (lowerDesc.includes('snow')) return weatherIcons.snow;
        if (lowerDesc.includes('mist') || lowerDesc.includes('fog')) return weatherIcons.mist;
        return 'bi-question-circle'; // Default icon
    }

    $('#getForecastBtn').click(async function () {
        const location = $('#locationInput').val().trim();
        const errorMessage = $('#errorMessage');
        const forecastContainer = $('#forecastContainer');
        const forecastTableBody = $('#forecastTableBody');
        const ctx = document.getElementById('temperatureChart').getContext('2d');

        errorMessage.text('');
        forecastContainer.hide();
        forecastTableBody.empty();

        if (!location) {
            errorMessage.text('Please enter a location.');
            return;
        }

        try {
            const response = await $.ajax({
                url: `https://api.openweathermap.org/data/2.5/forecast`,
                type: 'GET',
                data: {
                    q: location,
                    appid: apiKey,
                    units: 'metric',
                },
            });

            const forecasts = response.list.slice(0, 8); // First 8 intervals (3-hour gaps)
            const labels = [];
            const temperatures = [];

            forecasts.forEach((forecast) => {
                const description = forecast.weather[0].description;
                const icon = getWeatherIcon(description);

                labels.push(forecast.dt_txt.split(' ')[1]); // Extract time from date-time
                temperatures.push(forecast.main.temp.toFixed(1));

                forecastTableBody.append(`
                    <tr>
                        <td>${forecast.dt_txt}</td>
                        <td>${forecast.main.temp.toFixed(1)} °C</td>
                        <td>
                            <i class="bi ${icon} me-2"></i>${description}
                        </td>
                    </tr>
                `);
            });

            // Display table
            forecastContainer.show();

            // Create temperature chart
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: temperatures,
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                        borderWidth: 2,
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Time',
                                color: '#e0e0e0',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Temperature (°C)',
                                color: '#e0e0e0',
                            },
                            beginAtZero: false,
                        },
                    },
                },
            });
        } catch (error) {
            errorMessage.text('Unable to fetch weather data. Please check the location name or try again later.');
            console.error('API Error:', error);
        }
    });

    // Clear Data Button
    $('#clearDataBtn').click(function () {
        $('#locationInput').val('');
        $('#errorMessage').text('');
        $('#forecastContainer').hide();
        $('#forecastTableBody').empty();

        // Clear the chart (if it exists)
        if (Chart.getChart('temperatureChart')) {
            Chart.getChart('temperatureChart').destroy();
        }
    });
});
