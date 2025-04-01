// Tableau global pour stocker les tâches
let tasks = [];

/**
 * Initialise le projet au chargement de la page :
 * - Configure le mode sombre si sauvegardé
 * - Affiche ou masque le champ pour une nouvelle catégorie
 * - Charge les tâches sauvegardées et met à jour les filtres
 */
document.addEventListener('DOMContentLoaded', () => {
  // Gestion du mode sombre/clair
  const modeToggleButton = document.getElementById('modeToggle');
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    modeToggleButton.textContent = '☀️ Mode Clair';
  }
  modeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    modeToggleButton.textContent = isDark ? '☀️ Mode Clair' : '🌙 Mode Sombre';
  });

  // Affiche ou masque le champ "Nouvelle catégorie" selon le choix de l'utilisateur
  document.getElementById("categorySelect").addEventListener('change', () => {
    document.getElementById("newCategory").style.display =
      (document.getElementById("categorySelect").value === 'new') ? 'inline-block' : 'none';
  });

  // Met à jour les filtres lorsque l'utilisateur change une option
  document.getElementById("filterCategory").addEventListener("change", renderTasks);
  document.getElementById("filterPriority").addEventListener("change", renderTasks);

  // Charger les tâches sauvegardées depuis le localStorage
  tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  renderTasks();
});

/**
 * Sauvegarde le tableau des tâches dans le localStorage.
 */
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Met à jour et affiche les filtres de catégories en se basant sur :
 * - Les catégories de base (travail, personnel, urgent)
 * - Les catégories des tâches enregistrées
 * Ceci permet de remplacer d'éventuels anciens noms modifiés.
 */
function updateFilterCategories() {
  // Catégories de base
  const baseCategories = ["travail", "personnel", "urgent"];
  // Récupérer toutes les catégories utilisées dans les tâches
  let taskCategories = tasks.map(task => task.category.toLowerCase());
  // Fusionner et obtenir des valeurs uniques
  let allCategories = new Set([...baseCategories, ...taskCategories]);

  // Mise à jour du sélecteur de filtre pour la catégorie
  const filterCategorySelect = document.getElementById("filterCategory");
  // Conserver la sélection actuelle (si possible)
  let currentSelection = filterCategorySelect.value;
  // Réinitialiser les options
  filterCategorySelect.innerHTML = "";
  // Ajouter l'option "Toutes"
  let allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Toutes";
  filterCategorySelect.appendChild(allOption);
  // Ajouter chaque catégorie unique
  allCategories.forEach(cat => {
    let option = document.createElement("option");
    option.value = cat;
    // Met en majuscule la première lettre pour l'affichage
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    filterCategorySelect.appendChild(option);
  });
  // Restaurer la sélection si elle est toujours valide
  if (currentSelection) {
    filterCategorySelect.value = currentSelection;
  }
}

/**
 * Affiche les tâches enregistrées dans le tableau,
 * en appliquant les filtres sélectionnés et en mettant à jour les options de filtre.
 */
function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  const filterCategory = document.getElementById("filterCategory").value;
  const filterPriority = document.getElementById("filterPriority").value.toLowerCase();

  // Parcourir toutes les tâches
  tasks.forEach((task, index) => {
    // Appliquer le filtre de catégorie
    if (filterCategory !== "all" && task.category.toLowerCase() !== filterCategory.toLowerCase()) return;
    // Appliquer le filtre de priorité
    if (filterPriority !== "all" && task.priority.toLowerCase() !== filterPriority.toLowerCase()) return;

    // Création d'une ligne de tableau pour la tâche
    let row = document.createElement("tr");
    row.setAttribute("data-index", index);
    row.innerHTML = `
      <td class="task-text" contenteditable="false">${task.task}</td>
      <td class="category" contenteditable="false">${task.category}</td>
      <td class="priority" contenteditable="false">${task.priority}</td>
      <td>
        <button class="modify" onclick="editTask(this)">✏️ Modifier</button>
        <button class="delete" onclick="deleteTask(this)">❌ Supprimer</button>
      </td>
    `;
    taskList.appendChild(row);
  });

  // Met à jour le sélecteur de filtres pour la catégorie
  updateFilterCategories();
}

/**
 * Ajoute une nouvelle tâche à la liste, la sauvegarde, et met à jour l'affichage.
 */
function addTask() {
  const taskInput = document.getElementById("taskinput");
  const categorySelect = document.getElementById("categorySelect");
  const prioritySelect = document.getElementById("prioritySelect");
  const errorMessage = document.getElementById("error-message");
  // Mapping de la priorité en français
  const priorityMapping = { high: "Haute", medium: "Moyenne", low: "Basse" };

  let taskValue = taskInput.value.trim();
  let category = categorySelect.value;
  let priority = prioritySelect.value;

  // Vérifier que tous les champs sont remplis
  if (!taskValue || !category || !priority) {
    errorMessage.textContent = "Veuillez remplir tous les champs.";
    errorMessage.style.opacity = 1;
    setTimeout(() => errorMessage.style.opacity = 0, 2000);
    return;
  }

  // Gestion de la nouvelle catégorie si sélectionnée
  if (category === "new") {
    const newCategoryInput = document.getElementById("newCategory");
    category = newCategoryInput.value.trim();
    if (!category) {
      errorMessage.textContent = "Veuillez entrer une nouvelle catégorie.";
      errorMessage.style.opacity = 1;
      setTimeout(() => errorMessage.style.opacity = 0, 2000);
      return;
    }
    // Ajoute la nouvelle catégorie au sélecteur d'ajout
    let newOption = document.createElement("option");
    newOption.value = category.toLowerCase();
    newOption.textContent = category;
    document.getElementById("categorySelect").appendChild(newOption);
    // La fonction updateFilterCategories se chargera de mettre à jour le filtre
  }

  errorMessage.textContent = "";

  // Création de l'objet tâche
  const newTask = {
    task: taskValue,
    category: category,
    priority: priorityMapping[priority] || priority
  };
  tasks.push(newTask);
  saveTasks();
  renderTasks();

  // Réinitialiser les champs du formulaire
  taskInput.value = "";
  categorySelect.value = "";
  prioritySelect.value = "";
  document.getElementById("newCategory").style.display = "none";
}

/**
 * Supprime une tâche de la liste en se basant sur son index,
 * puis met à jour la sauvegarde et l'affichage.
 */
function deleteTask(button) {
  const index = button.parentElement.parentElement.getAttribute("data-index");
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

/**
 * Permet de modifier une tâche.
 * Seuls le texte et la catégorie sont éditables (la priorité reste figée).
 * Les champs éditables sont mis en évidence.
 */
function editTask(button) {
  let row = button.parentElement.parentElement;
  let index = row.getAttribute("data-index");
  let taskText = row.querySelector(".task-text");
  let taskCategory = row.querySelector(".category");
  // La priorité reste non éditable
  let taskPriority = row.querySelector(".priority");

  // Rendre le texte et la catégorie éditables et appliquer la classe "editing"
  taskText.contentEditable = "true";
  taskCategory.contentEditable = "true";
  taskText.classList.add("editing");
  taskCategory.classList.add("editing");

  // Changer le texte du bouton pour permettre l'enregistrement
  button.textContent = "💾 Enregistrer";
  button.setAttribute("onclick", "saveTask(this)");
}

/**
 * Enregistre les modifications apportées à une tâche.
 * La priorité reste inchangée.
 * La catégorie modifiée est mise à jour dans les filtres.
 */
function saveTask(button) {
  let row = button.parentElement.parentElement;
  let index = row.getAttribute("data-index");
  let taskText = row.querySelector(".task-text");
  let taskCategory = row.querySelector(".category");
  // La priorité reste non éditable
  let taskPriority = row.querySelector(".priority");

  // Met à jour l'objet tâche dans le tableau
  tasks[index] = {
    task: taskText.textContent.trim(),
    category: taskCategory.textContent.trim(),
    priority: taskPriority.textContent.trim()
  };
  saveTasks();

  // Rendre le texte et la catégorie non éditables et retirer la classe "editing"
  taskText.contentEditable = "false";
  taskCategory.contentEditable = "false";
  taskText.classList.remove("editing");
  taskCategory.classList.remove("editing");

  // Réinitialiser le bouton "Modifier"
  button.textContent = "✏️ Modifier";
  button.setAttribute("onclick", "editTask(this)");

  // Met à jour les filtres pour refléter le nouveau nom de catégorie
  updateFilterCategories();
}
