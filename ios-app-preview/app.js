/* ==========================================================================
   The Circle — iOS app preview
   Prototype navigation for index.html. Screens come from screens.js.
   ========================================================================== */

const viewport = document.getElementById('viewport');

const state = {
    screen: 'home',
    dark: false,
    arabic: false,
    branch: 'kafr-abdo',
    stack: []
};

/* Where a "Back" tap should land when the stack is empty. */
const PARENT = {
    detail: 'spaces',
    book1: 'home',
    book2: 'book1',
    book3: 'book2',
    confirm: 'bookings'
};

function currentHtml() {
    if (state.screen === 'home') {
        return homeScreen({ dark: state.dark, ar: state.arabic, branch: state.branch });
    }
    const html = SCREENS[state.screen].render();
    return state.dark ? html.replace('class="screen', 'class="screen dark') : html;
}

function render() {
    viewport.innerHTML = currentHtml();
    bind();
}

function go(screen, { push = true } = {}) {
    if (!screen || screen === state.screen) return;
    if (push) state.stack.push(state.screen);
    state.screen = screen;
    render();
}

function back() {
    const previous = state.stack.pop() || PARENT[state.screen] || 'home';
    state.screen = previous;
    render();
}

function bind() {
    viewport.querySelectorAll('[data-tab]').forEach(el =>
        el.addEventListener('click', () => {
            state.stack = [];
            go(el.dataset.tab === 'book' ? 'book1' : el.dataset.tab, { push: false });
        })
    );

    viewport.querySelectorAll('[data-next]').forEach(el =>
        el.addEventListener('click', () => go(el.dataset.next))
    );

    viewport.querySelectorAll('.nav-back, .glass-back').forEach(el =>
        el.addEventListener('click', back)
    );

    viewport.querySelectorAll('.space-row').forEach(el =>
        el.addEventListener('click', () => go('detail'))
    );

    viewport.querySelectorAll('.action-bar .btn:not([data-next])').forEach(el =>
        el.addEventListener('click', () => go('book1'))
    );

    viewport.querySelectorAll('.quick, .space-card').forEach(el =>
        el.addEventListener('click', () => go('book1'))
    );

    // Selection cards keep one choice active per group.
    viewport.querySelectorAll('.choice').forEach(el =>
        el.addEventListener('click', () => {
            let sibling = el.previousElementSibling;
            const group = [el];
            while (sibling && sibling.classList.contains('choice')) {
                group.push(sibling);
                sibling = sibling.previousElementSibling;
            }
            sibling = el.nextElementSibling;
            while (sibling && sibling.classList.contains('choice')) {
                group.push(sibling);
                sibling = sibling.nextElementSibling;
            }
            group.forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
        })
    );

    viewport.querySelectorAll('.cal-day:not(.dim)').forEach(el =>
        el.addEventListener('click', () => {
            viewport.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
            el.classList.add('selected');
        })
    );

    viewport.querySelectorAll('.slot:not(.taken)').forEach(el =>
        el.addEventListener('click', () => {
            el.classList.toggle('selected');
            el.classList.remove('range');
        })
    );

    viewport.querySelectorAll('.segmented button').forEach(el =>
        el.addEventListener('click', () => {
            if (el.dataset.branch) {
                state.branch = el.dataset.branch;
                render();
                return;
            }
            el.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            el.classList.add('active');
        })
    );
}

document.getElementById('toggleDark').addEventListener('click', e => {
    state.dark = !state.dark;
    e.currentTarget.classList.toggle('on', state.dark);
    render();
});

document.getElementById('toggleAr').addEventListener('click', e => {
    state.arabic = !state.arabic;
    e.currentTarget.classList.toggle('on', state.arabic);
    state.screen = 'home';
    state.stack = [];
    render();
});

render();
