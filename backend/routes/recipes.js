const router = require('express').Router();
let Recipe = require('../models/recipe.model');

// --- GET All Recipes ---
// Handles GET requests to: /recipes/
router.route('/').get((req, res) => {
  Recipe.find() // Finds all recipes in MongoDB
    .then(recipes => res.json(recipes)) // Returns them as JSON
    .catch(err => res.status(400).json('Error: ' + err));
});

// --- ADD New Recipe ---
// Handles POST requests to: /recipes/add
router.route('/add').post((req, res) => {
  const title = req.body.title;
  const instructions = req.body.instructions;
  const author = req.body.author;
  
  
  const ingredientsArray = req.body.ingredients.split(',').map(item => item.trim());

  // Create the new recipe using the model
  const newRecipe = new Recipe({
    title,
    ingredients: ingredientsArray, 
    instructions,
    author, 
  });

  // Save the new recipe to the database
  newRecipe.save()
    .then(() => res.json('Recipe added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// --- UPDATE Recipe ---
// Handles POST requests to: /recipes/update/some-id
router.route('/update/:id').post((req, res) => {
  Recipe.findById(req.params.id) 
    .then(recipe => {
      // Update all the fields with the new data from req.body
      recipe.title = req.body.title;
      recipe.instructions = req.body.instructions;
      recipe.author = req.body.author; 
      recipe.ingredients = req.body.ingredients.split(',').map(item => item.trim());

      // Save the updated recipe
      recipe.save()
        .then(() => res.json('Recipe updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});


// --- DELETE Recipe ---
// Handles DELETE requests to: /recipes/some-id-goes-here
router.route('/:id').delete((req, res) => {
  // req.params.id gets the ID from the URL
  Recipe.findByIdAndDelete(req.params.id)
    .then(() => res.json('Recipe deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;