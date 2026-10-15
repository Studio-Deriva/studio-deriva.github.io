/* Staff page: renders data/staff.json, which a GitHub Action refreshes from the Discord
   server (tools/sync-staff.mjs). The page never talks to Discord itself, so no token is
   ever shipped to the browser. */
(function () {
  var groupsEl = document.getElementById('groups');
  var emptyEl = document.getElementById('empty');
  var syncedEl = document.getElementById('synced');

  function hex(n) { return n ? '#' + ('000000' + n.toString(16)).slice(-6) : '#99AAB5'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ago(iso) {
    var mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 2) return 'just now';
    if (mins < 60) return mins + ' minutes ago';
    var h = Math.round(mins / 60);
    if (h < 48) return h + (h === 1 ? ' hour ago' : ' hours ago');
    return Math.round(h / 24) + ' days ago';
  }

  var SHOWN = 2; // role pills visible before "See more"
  function person(m, groupColor) {
    var roles = m.roles.map(function (r, i) {
      return '<li style="--c:' + hex(r.color) + '"' + (i >= SHOWN ? ' class="extra"' : '') + '>' + esc(r.name) + '</li>';
    }).join('');
    var extra = m.roles.length - SHOWN;
    var more = extra > 0 ? '<button class="see-more" type="button" aria-expanded="false" data-more="' + extra + '">See ' + extra + ' more</button>' : '';
    return '<li class="person" style="--role:' + groupColor + '">' +
      '<div class="avatar"><img src="' + esc(m.avatar) + '" alt="" width="90" height="90" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.visibility=\'hidden\'"></div>' +
      '<h3>' + esc(m.name) + '</h3>' +
      '<p class="handle">@' + esc(m.username) + '</p>' +
      '<ul class="roles" aria-label="Roles">' + roles + '</ul>' + more +
      '<a class="more" href="https://discord.com/users/' + esc(m.id) + '" target="_blank" rel="noopener">Discord profile</a>' +
      '</li>';
  }

  function render(data) {
    var groups = (data && data.groups || []).filter(function (g) { return g.members && g.members.length; });
    if (!groups.length) { emptyEl.hidden = false; return; }
    groupsEl.innerHTML = groups.map(function (g) {
      var color = hex(g.role.color);
      return '<div class="group" role="group" style="--role:' + color + '" aria-labelledby="role-' + esc(g.role.id) + '">' +
        '<div class="group-head"><h2 id="role-' + esc(g.role.id) + '">' + esc(g.role.name) + '</h2><span>' + g.members.length + (g.members.length === 1 ? ' person' : ' people') + '</span></div>' +
        '<ul class="people">' + g.members.map(function (m) { return person(m, color); }).join('') + '</ul>' +
        '</div>';
    }).join('');
    if (data.updated) {
      syncedEl.querySelector('span').textContent = 'Synced from Discord ' + ago(data.updated);
      syncedEl.hidden = false;
    }
  }

  groupsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.see-more');
    if (!b) return;
    var card = b.closest('.person');
    var open = card.classList.toggle('open');
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    b.textContent = open ? 'See less' : 'See ' + b.dataset.more + ' more';
  });

  fetch('data/staff.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () { emptyEl.hidden = false; });
})();
