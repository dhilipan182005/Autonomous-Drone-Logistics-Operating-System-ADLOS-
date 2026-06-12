const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('AIRX Frontend DOM Validations', () => {
    let dom;
    let document;

    beforeEach(() => {
        const html = fs.readFileSync(path.resolve(__dirname, '../../frontend/airx-web/index.html'), 'utf8');
        dom = new JSDOM(html, { runScripts: 'dangerously' });
        document = dom.window.document;
    });

    test('It should render the NO DATA AVAILABLE alert by default', () => {
        const alertBox = document.getElementById('no-data-alert');
        expect(alertBox).not.toBeNull();
        expect(alertBox.textContent).toContain('NO DATA AVAILABLE');
    });

    test('It should display correct DGCA header titles', () => {
        const header = document.querySelector('h1');
        expect(header.textContent).toBe('AIRX NATIONAL DRONE AIRSPACE INTELLIGENCE PLATFORM');
    });

    test('It should have KPI placeholders', () => {
        const activeFlights = document.getElementById('kpi-active');
        expect(activeFlights.textContent).toBe('0');
    });
});
