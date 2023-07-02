var completedVsNotCompleted = document.getElementById('completed-vs-not-completed').getContext('2d');
var completedVsNotCompletedChart = new Chart(completedVsNotCompleted, {
    type: 'doughnut',
    data: {
        labels: ['Not Completed', 'Completed'],
        datasets: [{
            data: [50, 50],
            backgroundColor: [
                'white',
                'green'
            ],
            borderColor: [
                'darkgreen',
                'darkgreen'
            ],
            borderWidth: 1
        }]
    },
    options: {
       
    }
});

var priority = document.getElementById('priority').getContext('2d');
var priorityChart = new Chart(priority, {
    type: 'doughnut',
    data: {
        labels: ['1', '2', '3', 'Other'],
        datasets: [{
            data: [5, 5, 5, 15],
            backgroundColor: [
                'gold',
                'silver',
                '#CD7F32',
                'white'
            ],
            borderColor: [
                'black',
                'black',
                'black',
                'black'
            ],
            borderWidth: 1
        }]
    },
    options: {
       
    }
});

var pointsWeekly = document.getElementById('points-weekly').getContext('2d');
var pointsWeeklyChart = new Chart(pointsWeekly, {
 type: 'line',
    data: {
        labels: ['Past Average', '3 Weeks Ago', '2 Weeks Ago', '1 Week Ago', 'This Week'],
        datasets: [{
            data: [12133, 11222, 5900, 8565, 1509],
            backgroundColor: [
                'white',
                'yellow',
                'gold',
                'goldenrod',
                'red'
            ],
            borderColor: [
                'black',
                'black',
                'black',
                'black'
            ],
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false
            },
        }
    }
});

var pointsDaily = document.getElementById('points-daily').getContext('2d');
var pointsDailyChart = new Chart(pointsDaily, {
    type: 'line',
    data: {
        labels: [ 'Past Average', '3 Days Ago', '2 Days Ago', '1 Days Ago', 'Today'],
        datasets: [{
            data: [2131, 2113, 2244, 2123, 1901],
            backgroundColor: [
                'white',
                'yellow',
                'gold',
                'goldenrod',
                'red'
            ],
            borderColor: [
                'black',
                'black',
                'black',
                'black'
            ],
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false
            },
        }
    }
});

var pointsYear = document.getElementById('points-year').getContext('2d');
var pointsYearChart = new Chart(pointsYear, {
    type: 'line',
    data: {
        labels: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [{
            data: [9456, 12659, 10675, 11352, 9575, 11023, 9002, 10214, 12012, 13234, 12021, 8105],
            backgroundColor: [
                'white',
            ],
            borderColor: [
                'black',
                'black',
                'black',
                'black'
            ],
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false
            },
        }
    }
});
