 // ===== DONNÉES =====
let orders = [];        // Tableau de toutes les commandes
let currentFilter = 'all'; // Filtre actif

// ===== AJOUTER UNE COMMANDE =====
function addOrder() {
  const clientInput  = document.getElementById('client-name');
  const productInput = document.getElementById('product');
  const qtyInput     = document.getElementById('quantity');
  const priceInput   = document.getElementById('price');
  const errorMsg     = document.getElementById('error-msg');

  // Lecture des valeurs
  const client  = clientInput.value.trim();
  const product = productInput.value;
  const qty     = parseFloat(qtyInput.value);
  const price   = parseFloat(priceInput.value);

  // --- Validation ---
  if (!client) {
    showError('Veuillez entrer le nom du client.');
    clientInput.focus();
    return;
  }
  if (!product) {
    showError('Veuillez choisir un produit.');
    productInput.focus();
    return;
  }
  if (!qty || qty <= 0) {
    showError('Veuillez entrer une quantité valide (> 0).');
    qtyInput.focus();
    return;
  }
  if (!price || price <= 0) {
    showError('Veuillez entrer un prix valide (> 0).');
    priceInput.focus();
    return;
  }

  // Effacer l'erreur
  errorMsg.textContent = '';

  // Créer l'objet commande
  const newOrder = {
    id:      Date.now(),
    client:  client,
    product: product,
    qty:     qty,
    price:   price,
    total:   qty * price,
    statut:  'En cours',
    date:    new Date().toLocaleDateString('fr-FR')
  };

  // Ajouter au tableau
  orders.push(newOrder);

  // Réinitialiser le formulaire
  clientInput.value  = '';
  productInput.value = '';
  qtyInput.value     = '';
  priceInput.value   = '';

  // Mettre à jour l'affichage
  renderOrders();
  updateStats();
}

// ===== AFFICHER UNE ERREUR =====
function showError(message) {
  const errorMsg = document.getElementById('error-msg');
  errorMsg.textContent = '⚠️ ' + message;
}

// ===== CHANGER LE STATUT =====
function toggleStatus(id) {
  const order = orders.find(o => o.id === id);
  if (!order) return;

  // Sens unique : En cours → Livré uniquement
  if (order.statut === 'En cours') {
    order.statut = 'Livré';
  }

  renderOrders();
  updateStats();
}

// ===== SUPPRIMER UNE COMMANDE =====
function deleteOrder(id) {
  const order = orders.find(o => o.id === id);
  if (!order) return;

  if (!confirm(`Supprimer la commande de ${order.client} ?`)) return;

  orders = orders.filter(o => o.id !== id);

  renderOrders();
  updateStats();
}

// ===== FILTRER LES COMMANDES =====
function filterOrders(filter, btn) {
  currentFilter = filter;

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  renderOrders();
}

// ===== RENDRE LA LISTE DES COMMANDES =====
function renderOrders() {
  const list       = document.getElementById('orders-list');
  const emptyState = document.getElementById('empty-state');
  const countEl    = document.getElementById('orders-count');

  let filtered = orders;
  if (currentFilter !== 'all') {
    filtered = orders.filter(o => o.statut === currentFilter);
  }

  countEl.textContent = filtered.length + ' commande(s)';

  const items = list.querySelectorAll('.order-item');
  items.forEach(el => el.remove());

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  const reversed = [...filtered].reverse();

  reversed.forEach(order => {
    const item = document.createElement('div');
    item.className = 'order-item';
    item.setAttribute('data-id', order.id);

    const badgeClass  = order.statut === 'En cours' ? 'badge-encours' : 'badge-livre';
    const statusLabel = order.statut === 'En cours' ? '⏳ En cours' : '✅ Livré';

    item.innerHTML = `
      <div class="order-info">
        <div class="order-client">🐒 ${escapeHTML(order.client)}</div>
        <div class="order-details">
          ${escapeHTML(order.product)} &nbsp;|&nbsp;
          ${order.qty} kg × ${formatNumber(order.price)} Ar
          &nbsp;|&nbsp; 📅 ${order.date}
        </div>
      </div>
      <div class="order-total">
        ${formatNumber(order.total)} Ar
      </div>
      <div class="order-actions">
        <button
          class="badge ${badgeClass}"
          onclick="toggleStatus(${order.id})"
          title="Cliquer pour changer le statut"
        >${statusLabel}</button>
        <button
          class="btn-delete"
          onclick="deleteOrder(${order.id})"
          title="Supprimer la commande"
        >🗑️</button>
      </div>
    `;

    list.appendChild(item);
  });
}

// ===== METTRE À JOUR LES STATISTIQUES =====
function updateStats() {
  const total   = orders.length;
  const enCours = orders.filter(o => o.statut === 'En cours').length;
  const livres  = orders.filter(o => o.statut === 'Livré').length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);

  document.getElementById('stat-total').textContent   = total;
  document.getElementById('stat-encours').textContent = enCours;
  document.getElementById('stat-livre').textContent   = livres;
  document.getElementById('stat-revenue').textContent = formatNumber(revenue) + ' Ar';
}

// ===== UTILITAIRES =====
function formatNumber(n) {
  return Math.round(n).toLocaleString('fr-FR');
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ===== ENTRÉE CLAVIER POUR LES COMMANDES =====
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const active = document.activeElement;
    const isFormField = active && (
      active.id === 'client-name' ||
      active.id === 'product'     ||
      active.id === 'quantity'    ||
      active.id === 'price'
    );
    if (isFormField) {
      addOrder();
    }
  }
});

// ===== RÉTROSPECTIVE ÉDITABLE EN LIVE =====
function addRetroItem(colonne) {
  // Associer colonne → id de l'input et de la liste
  const config = {
    good:   { inputId: 'retro-good-input',   listId: 'retro-good-list'   },
    bad:    { inputId: 'retro-bad-input',    listId: 'retro-bad-list'    },
    action: { inputId: 'retro-action-input', listId: 'retro-action-list' }
  };

  const { inputId, listId } = config[colonne];
  const input = document.getElementById(inputId);
  const list  = document.getElementById(listId);

  const texte = input.value.trim();
  if (!texte) return; // Ne rien faire si le champ est vide

  // Créer l'élément <li>
  const li = document.createElement('li');
  li.textContent = texte;
  li.style.animation = 'slideIn 0.25s ease'; // Même animation que les commandes

  list.appendChild(li);

  // Vider l'input et remettre le focus
  input.value = '';
  input.focus();
}

// ===== ENTRÉE CLAVIER POUR LA RÉTROSPECTIVE =====
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const active = document.activeElement;
    if (active && active.id === 'retro-good-input')   addRetroItem('good');
    if (active && active.id === 'retro-bad-input')    addRetroItem('bad');
    if (active && active.id === 'retro-action-input') addRetroItem('action');
  }
});

// ===== INITIALISATION : commandes de démonstration =====
function loadDemoData() {
  const demoOrders = [
    { id: 1, client: 'Timi le singe',  product: 'Banane Jaune',    qty: 10, price: 2000, total: 20000, statut: 'Livré',    date: '28/04/2025' },
    { id: 2, client: 'Koko',           product: 'Banane Bio',      qty: 5,  price: 3500, total: 17500, statut: 'Livré',    date: '29/04/2025' },
    { id: 3, client: 'Bobo',           product: 'Banane Plantain', qty: 8,  price: 1500, total: 12000, statut: 'En cours', date: '30/04/2025' },
    { id: 4, client: 'Client Royal',   product: 'Jus de Banane',   qty: 3,  price: 4000, total: 12000, statut: 'En cours', date: '01/05/2025' },
  ];

  orders = demoOrders;
  renderOrders();
  updateStats();
}

document.addEventListener('DOMContentLoaded', function() {
  loadDemoData();
});