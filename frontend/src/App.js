import React, { useState, useEffect } from 'react';
import axios from 'axios'; 


function App() {
  
  const [recipes, setRecipes] = useState([]);
  
  // --- NEW --- This state holds what the user is typing into the form
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    author: '' 
  });
  
 
  const [editingId, setEditingId] = useState(null);

  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/recipes';

  // --- useEffect Hook ---
  // This runs once when the component first loads
  // It fetches all the recipes from the backend
  useEffect(() => {
    fetchRecipes();
  }, [API_URL]); 

  // --- Helper Functions ---
  const fetchRecipes = () => {
    axios.get(API_URL)
      .then(response => {
        setRecipes(response.data); 
      })
      .catch(error => console.error('Error fetching recipes:', error));
  };

  // Updates the formData state as the user types
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // --- NEW --- Function to clear the form and exit editing mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      ingredients: '',
      instructions: '',
      author: '' 
    });
  };

  // --- NEW --- Function to fill the form when "Edit" is clicked
  const handleEditClick = (recipe) => {
    setEditingId(recipe._id);
    setFormData({
      title: recipe.title,
      // .join() turns the array ["eggs", "milk"] back into "eggs, milk"
      ingredients: recipe.ingredients.join(', '), 
      instructions: recipe.instructions,
      author: recipe.author 
    });
  };
  
  // --- NEW --- Function to format the date string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // --- Form Submission (Handles BOTH Add and Update) ---
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from reloading
    if (!formData.title || !formData.ingredients || !formData.instructions || !formData.author) {
      alert("Please fill out all fields"); 
      return;
    }

    if (editingId) {
      // --- UPDATE LOGIC ---
      // We are in "Edit Mode", so send a POST request to the /update/:id route
      axios.post(`${API_URL}/update/${editingId}`, formData)
        .then(() => {
          fetchRecipes(); // Re-fetch the list to show the update
          handleCancelEdit(); // Clear the form and exit edit mode
        })
        .catch(error => console.error('Error updating recipe:', error));
    } else {
      // --- ADD LOGIC ---
      // We are in "Add Mode", so send a POST request to the /add route
      axios.post(`${API_URL}/add`, formData)
        .then(() => {
          fetchRecipes(); // Re-fetch the list to show the new recipe
          // Clear only the form fields, leave author as is (optional)
          setFormData({ 
            title: '', 
            ingredients: '', 
            instructions: '',
            author: formData.author // --- Keep author for next entry ---
          });
        })
        .catch(error => console.error('Error adding recipe:', error));
    }
  };

  // --- Handle Recipe Deletion ---
  const deleteRecipe = (id) => {
    // Sends a DELETE request to the backend /:id route
    axios.delete(`${API_URL}/${id}`)
      .then(() => {
        fetchRecipes(); // Re-fetches the list to show the recipe is gone
      })
      .catch(error => console.error('Error deleting recipe:', error));
  };

  // --- JSX (What gets rendered) ---
  return (
    <div className="app-container">
      <header>
        <h1>My Recipe Box</h1>
      </header>

      {/* --- The Form Column --- */}
      <div className="form-container">
        {/* --- NEW --- Title changes based on editing state */}
        <h2>{editingId ? 'Update Recipe' : 'Add a New Recipe'}</h2>
        
        <form onSubmit={handleSubmit} className="recipe-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Scrambled Eggs"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          
          {/* --- NEW AUTHOR FIELD --- */}
          <div className="form-group">
            <label>Author</label>
            <input
              type="text"
              name="author"
              placeholder="e.g., Tejas"
              value={formData.author}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Ingredients</label>
            <input
              type="text"
              name="ingredients"
              placeholder="e.g., 2 eggs, 1 tbsp milk, salt"
              value={formData.ingredients}
              onChange={handleInputChange}
              className="form-input"
            />
            <small>Please separate ingredients with a comma (,)</small>
          </div>
          <div className="form-group">
            <label>Instructions</label>
            <textarea
              name="instructions"
              placeholder="1. Whisk eggs and milk...&#10;2. Cook on low heat..."
              value={formData.instructions}
              onChange={handleInputChange}
              className="form-textarea"
            />
          </div>
          
          {/* --- NEW --- Button text changes based on editing state */}
          <button type="submit" className="submit-btn">
            {editingId ? 'Update Recipe' : 'Add Recipe'}
          </button>
          
          {/* --- NEW --- Show "Cancel" button only when editing */}
          {editingId && (
            <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
              Cancel Update
            </button>
          )}
        </form>
      </div>

      {/* --- The Recipes Grid Column --- */}
      <div className="recipe-list-container">
        {recipes.length === 0 ? (
          <p className="empty-state">No recipes added yet. Add one!</p>
        ) : (
          // --- OUTER MAP: Loop over each recipe ---
          recipes.map(recipe => (
            <div key={recipe._id} className="recipe-card">
              
              <div className="recipe-card-header">
                <h3>{recipe.title}</h3>
                <div>
                  {/* --- NEW --- Edit Button (✎) */}
                  <button onClick={() => handleEditClick(recipe)} className="edit-btn">
                    ✎
                  </button>
                  {/* The "×" is a nice 'X' symbol */}
                  <button onClick={() => deleteRecipe(recipe._id)} className="delete-btn">
                    &times; 
                  </button>
                </div>
              </div>

              {/* --- NEW AUTHOR AND DATE SECTION --- */}
              <div className="recipe-meta">
                <span className="recipe-author">By: {recipe.author}</span>
                <span className="recipe-date">{formatDate(recipe.createdAt)}</span>
              </div>

              <h4>Ingredients</h4>
              <ul className="ingredients-list">
                {/* --- INNER MAP: Loop over ingredients array --- */}
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>

              <h4>Instructions</h4>
              <p className="instructions-text">{recipe.instructions}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;