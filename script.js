
        let display = document.getElementById('display');
        let expression = document.getElementById('expression');
        let history = document.getElementById('history');
        let currentMode = 'basic';
        let currentExpression = '';
        let calculationHistory = [];

        // Currency exchange rates (mock data - in real app, fetch from API)
        const exchangeRates = {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
            JPY: 110,
            INR: 74.5,
            CAD: 1.25,
            AUD: 1.35,
            CHF: 0.92,
            CNY: 6.45
        };

        // Metric conversion factors
        const metricConversions = {
            length: {
                m: 1,
                cm: 100,
                km: 0.001,
                in: 39.3701,
                ft: 3.28084,
                yd: 1.09361,
                mi: 0.000621371
            },
            weight: {
                kg: 1,
                g: 1000,
                lb: 2.20462,
                oz: 35.274,
                ton: 0.001
            },
            temperature: {
                c: { c: 1, f: (c) => c * 9/5 + 32, k: (c) => c + 273.15 },
                f: { c: (f) => (f - 32) * 5/9, f: 1, k: (f) => (f - 32) * 5/9 + 273.15 },
                k: { c: (k) => k - 273.15, f: (k) => (k - 273.15) * 9/5 + 32, k: 1 }
            },
            area: {
                m2: 1,
                cm2: 10000,
                km2: 0.000001,
                in2: 1550,
                ft2: 10.764,
                yd2: 1.196,
                acre: 0.000247
            },
            volume: {
                l: 1,
                ml: 1000,
                gal: 0.264172,
                qt: 1.05669,
                pt: 2.11338,
                cup: 4.22675,
                floz: 33.814
            },
            speed: {
                mps: 1,
                kph: 3.6,
                mph: 2.237,
                fps: 3.281,
                knot: 1.944
            }
        };

        let currentMetricType = 'length';

        function setMode(mode) {
            currentMode = mode;
            
            // Update mode buttons
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Show/hide panels
            document.getElementById('basicButtons').style.display = mode === 'basic' ? 'grid' : 'none';
            document.getElementById('metricPanel').classList.toggle('active', mode === 'metric');
            document.getElementById('currencyPanel').classList.toggle('active', mode === 'currency');
            
            if (mode === 'metric') {
                setMetricType('length');
            } else if (mode === 'currency') {
                updateCurrencyDisplay();
            }
        }

        function appendToDisplay(value) {
            if (display.textContent === '0' || display.textContent === 'Error') {
                display.textContent = value;
                currentExpression = value;
            } else {
                display.textContent += value;
                currentExpression += value;
            }
            expression.textContent = currentExpression;
        }

        function appendFunction(func) {
            if (func === 'sqrt') {
                appendToDisplay('Math.sqrt(');
            }
        }

        function clearAll() {
            display.textContent = '0';
            currentExpression = '';
            expression.textContent = '';
        }

        function clearEntry() {
            display.textContent = '0';
            currentExpression = '';
            expression.textContent = '';
        }

        function deleteLast() {
            if (currentExpression.length > 0) {
                currentExpression = currentExpression.slice(0, -1);
                display.textContent = currentExpression || '0';
                expression.textContent = currentExpression;
            }
        }

        function calculate() {
            try {
                // Replace × with * for calculation
                let expr = currentExpression.replace(/×/g, '*');
                
                // Handle power operator
                expr = expr.replace(/\*\*/g, '**');
                
                // Evaluate the expression
                let result = eval(expr);
                
                // Add to history
                calculationHistory.unshift(`${currentExpression} = ${result}`);
                if (calculationHistory.length > 5) {
                    calculationHistory.pop();
                }
                updateHistory();
                
                display.textContent = result;
                currentExpression = result.toString();
                expression.textContent = '';
                
            } catch (error) {
                display.textContent = 'Error';
                currentExpression = '';
                expression.textContent = '';
            }
        }

        function updateHistory() {
            history.innerHTML = '';
            calculationHistory.forEach(item => {
                let historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.textContent = item;
                history.appendChild(historyItem);
            });
        }

        function setMetricType(type) {
            currentMetricType = type;
            let fromUnit = document.getElementById('metricFromUnit');
            let toUnit = document.getElementById('metricToUnit');
            
            fromUnit.innerHTML = '';
            toUnit.innerHTML = '';
            
            let units = getUnitsForType(type);
            units.forEach(unit => {
                let option1 = document.createElement('option');
                option1.value = unit.value;
                option1.textContent = unit.text;
                fromUnit.appendChild(option1);
                
                let option2 = document.createElement('option');
                option2.value = unit.value;
                option2.textContent = unit.text;
                toUnit.appendChild(option2);
            });
            
            convertMetric();
        }

        function getUnitsForType(type) {
            switch(type) {
                case 'length':
                    return [
                        {value: 'm', text: 'Meters'},
                        {value: 'cm', text: 'Centimeters'},
                        {value: 'km', text: 'Kilometers'},
                        {value: 'in', text: 'Inches'},
                        {value: 'ft', text: 'Feet'},
                        {value: 'yd', text: 'Yards'},
                        {value: 'mi', text: 'Miles'}
                    ];
                case 'weight':
                    return [
                        {value: 'kg', text: 'Kilograms'},
                        {value: 'g', text: 'Grams'},
                        {value: 'lb', text: 'Pounds'},
                        {value: 'oz', text: 'Ounces'},
                        {value: 'ton', text: 'Tons'}
                    ];
                case 'temperature':
                    return [
                        {value: 'c', text: 'Celsius'},
                        {value: 'f', text: 'Fahrenheit'},
                        {value: 'k', text: 'Kelvin'}
                    ];
                case 'area':
                    return [
                        {value: 'm2', text: 'Square Meters'},
                        {value: 'cm2', text: 'Square Centimeters'},
                        {value: 'km2', text: 'Square Kilometers'},
                        {value: 'in2', text: 'Square Inches'},
                        {value: 'ft2', text: 'Square Feet'},
                        {value: 'yd2', text: 'Square Yards'},
                        {value: 'acre', text: 'Acres'}
                    ];
                case 'volume':
                    return [
                        {value: 'l', text: 'Liters'},
                        {value: 'ml', text: 'Milliliters'},
                        {value: 'gal', text: 'Gallons'},
                        {value: 'qt', text: 'Quarts'},
                        {value: 'pt', text: 'Pints'},
                        {value: 'cup', text: 'Cups'},
                        {value: 'floz', text: 'Fluid Ounces'}
                    ];
                case 'speed':
                    return [
                        {value: 'mps', text: 'Meters/Second'},
                        {value: 'kph', text: 'Kilometers/Hour'},
                        {value: 'mph', text: 'Miles/Hour'},
                        {value: 'fps', text: 'Feet/Second'},
                        {value: 'knot', text: 'Knots'}
                    ];
                default:
                    return [];
            }
        }

        function convertMetric() {
            let input = document.getElementById('metricInput').value;
            let fromUnit = document.getElementById('metricFromUnit').value;
            let toUnit = document.getElementById('metricToUnit').value;
            let output = document.getElementById('metricOutput');
            
            if (input === '') {
                output.value = '';
                return;
            }
            
            let inputValue = parseFloat(input);
            if (isNaN(inputValue)) {
                output.value = 'Invalid input';
                return;
            }
            
            let result = performMetricConversion(inputValue, fromUnit, toUnit, currentMetricType);
            output.value = result.toFixed(6).replace(/\.?0+$/, '');
        }

        function performMetricConversion(value, fromUnit, toUnit, type) {
            if (type === 'temperature') {
                let conversions = metricConversions.temperature;
                if (fromUnit === toUnit) return value;
                
                if (typeof conversions[fromUnit][toUnit] === 'function') {
                    return conversions[fromUnit][toUnit](value);
                }
                return value;
            } else {
                let conversions = metricConversions[type];
                if (!conversions) return value;
                
                // Convert to base unit, then to target unit
                let baseValue = value / conversions[fromUnit];
                return baseValue * conversions[toUnit];
            }
        }

        function convertCurrency() {
            let input = document.getElementById('currencyInput').value;
            let fromCurrency = document.getElementById('currencyFrom').value;
            let toCurrency = document.getElementById('currencyTo').value;
            let output = document.getElementById('currencyOutput');
            
            if (input === '') {
                output.value = '';
                return;
            }
            
            let inputValue = parseFloat(input);
            if (isNaN(inputValue)) {
                output.value = 'Invalid input';
                return;
            }
            
            // Convert to USD first, then to target currency
            let usdValue = inputValue / exchangeRates[fromCurrency];
            let result = usdValue * exchangeRates[toCurrency];
            
            output.value = result.toFixed(2);
        }

        function updateCurrencyDisplay() {
            let fromCurrency = document.getElementById('currencyFrom')?.value || 'USD';
            let toCurrency = document.getElementById('currencyTo')?.value || 'EUR';
            let rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
            document.getElementById('currencyDisplay').textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
        }

        // Event listeners
        document.getElementById('metricInput')?.addEventListener('input', convertMetric);
        document.getElementById('metricFromUnit')?.addEventListener('change', convertMetric);
        document.getElementById('metricToUnit')?.addEventListener('change', convertMetric);

        document.getElementById('currencyInput')?.addEventListener('input', convertCurrency);
        document.getElementById('currencyFrom')?.addEventListener('change', () => {
            convertCurrency();
            updateCurrencyDisplay();
        });
        document.getElementById('currencyTo')?.addEventListener('change', () => {
            convertCurrency();
            updateCurrencyDisplay();
        });

        // Keyboard support
        document.addEventListener('keydown', function(event) {
            if (currentMode !== 'basic') return;
            
            let key = event.key;
            
            if (key >= '0' && key <= '9') {
                appendToDisplay(key);
            } else if (key === '.') {
                appendToDisplay('.');
            } else if (key === '+') {
                appendToDisplay('+');
            } else if (key === '-') {
                appendToDisplay('-');
            } else if (key === '*') {
                appendToDisplay('*');
            } else if (key === '/') {
                event.preventDefault();
                appendToDisplay('/');
            } else if (key === 'Enter' || key === '=') {
                calculate();
            } else if (key === 'Escape') {
                clearAll();
            } else if (key === 'Backspace') {
                deleteLast();
            } else if (key === '(') {
                appendToDisplay('(');
            } else if (key === ')') {
                appendToDisplay(')');
            }
        });

        // Initialize
        setMode('basic');
    