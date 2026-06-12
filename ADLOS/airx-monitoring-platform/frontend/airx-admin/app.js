// API URLs
const PERMISSIONS_API = '/api/permissions';
const VIOLATIONS_API = '/api/gis/violations';

async function loadPermissions() {
    try {
        const res = await fetch(PERMISSIONS_API);
        if (!res.ok) throw new Error("Failed to load permissions");
        const list = await res.json();
        
        const tbody = document.getElementById('permissions-tbody');
        tbody.innerHTML = '';

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No permission requests logged.</td></tr>';
            return;
        }

        list.forEach(req => {
            const tr = document.createElement('tr');
            
            let statusBadge = '';
            let actionHtml = '';

            if (req.status === 'PENDING') {
                statusBadge = `<span class="badge yellow-badge">PENDING</span>`;
                actionHtml = `
                    <button class="btn btn-success" onclick="approveRequest('${req.requestId}')">Approve</button>
                    <button class="btn btn-danger" onclick="rejectRequest('${req.requestId}')">Reject</button>
                `;
            } else if (req.status === 'APPROVED') {
                statusBadge = `<span class="badge green-badge">APPROVED</span>`;
                actionHtml = `<span style="font-size:11px; color:#6B7280;">BY: ${req.approvedBy || 'SYSTEM'}</span>`;
            } else {
                statusBadge = `<span class="badge red-badge">${req.status}</span>`;
                actionHtml = `<span style="font-size:11px; color:#6B7280;">BY: ${req.approvedBy || 'SYSTEM'}</span>`;
            }

            tr.innerHTML = `
                <td><b>${req.requestId}</b></td>
                <td><span style="font-family:monospace; font-weight:bold;">${req.droneId}</span></td>
                <td><span style="font-family:monospace;">${req.operatorId}</span></td>
                <td><code style="font-size:10px; color:#6B7280;">${req.route || 'No Route Plotted'}</code></td>
                <td>${statusBadge}</td>
                <td>${actionHtml}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        document.getElementById('permissions-tbody').innerHTML = '<tr><td colspan="6" class="text-center" style="color:red;">Error connecting to authorization services.</td></tr>';
    }
}

async function approveRequest(requestId) {
    if (confirm(`Approve flight path authorization request: ${requestId}?`)) {
        try {
            const res = await fetch(`${PERMISSIONS_API}/${requestId}/approve?officer=DGCA_OFFICIAL_09`, {
                method: 'POST'
            });
            if (res.ok) {
                loadPermissions();
            } else {
                alert("Failed to approve flight path.");
            }
        } catch (err) {
            console.error(err);
        }
    }
}

async function rejectRequest(requestId) {
    if (confirm(`Reject flight path authorization request: ${requestId}?`)) {
        try {
            const res = await fetch(`${PERMISSIONS_API}/${requestId}/reject?officer=DGCA_OFFICIAL_09`, {
                method: 'POST'
            });
            if (res.ok) {
                loadPermissions();
            } else {
                alert("Failed to reject flight path.");
            }
        } catch (err) {
            console.error(err);
        }
    }
}

async function loadViolations() {
    try {
        const res = await fetch(VIOLATIONS_API);
        if (!res.ok) throw new Error("Failed to load violations");
        const list = await res.json();
        
        const tbody = document.getElementById('violations-tbody');
        tbody.innerHTML = '';

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No ongoing violation audits.</td></tr>';
            return;
        }

        list.forEach(v => {
            const tr = document.createElement('tr');
            
            const date = new Date(v.timestamp);
            const timeStr = date.toLocaleString();
            
            let severityBadge = '';
            if (v.severity === 'INFO') severityBadge = `<span class="badge blue-badge">INFO</span>`;
            else if (v.severity === 'WARNING') severityBadge = `<span class="badge yellow-badge">WARNING</span>`;
            else if (v.severity === 'CRITICAL') severityBadge = `<span class="badge red-badge">CRITICAL</span>`;
            else severityBadge = `<span class="badge red-badge" style="background-color:#8B0000;">EMERGENCY</span>`;

            tr.innerHTML = `
                <td><b>VIO-${v.id}</b></td>
                <td><span style="font-family:monospace; font-weight:bold;">${v.droneId}</span></td>
                <td><span style="font-family:monospace;">${v.operatorId}</span></td>
                <td><b style="color:#8B0000;">${v.type.replace(/_/g, ' ')}</b></td>
                <td>${timeStr}</td>
                <td>${severityBadge}</td>
                <td><span class="badge grey-badge">${v.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
        document.getElementById('violations-tbody').innerHTML = '<tr><td colspan="7" class="text-center" style="color:red;">Error connecting to audit services.</td></tr>';
    }
}

// Initial Load & Auto Refresh
loadPermissions();
loadViolations();
setInterval(() => {
    loadPermissions();
    loadViolations();
}, 5000);
