import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as likesView from './views/likesView';
import {elements,renderLoader,clearLoader} from './views/base';
import Recipe from './models/Recipe';
import List from  './models/List';
import Likes from './models/Likes';
import * as listView from './views/listView'; 

//import clearInput from './views/searchView';
 const state = {}
 window.state = state;
const controlSearch = async () => {
    const query =searchView.getInput();
   // console.log(query);
    if(query) {
        state.search = new Search(query);

        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try {
            await state.search.getResults();
        clearLoader();
        //console.log(state.search.result);
       searchView.renderResults(state.search.result);
        }catch(error){
            alert(error);
        }

    }
}
 elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
 });
const search = new Search("pasta");
elements.searchResPages.addEventListener('click',e => {
   // console.log(e);
    const btn = e.target.closest('.btn-inline');

    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
       // console.log(goToPage);
    }
});


const r = new Recipe(46956);
r.getRecipe();
console.log(r);

//RECIPE CONTROLLER

const controlRecipe = async() => {
    const id = window.location.hash.replace('#','');
    console.log(id);
    
    if(id){
        //Prepare UI for changes
        recipeView.clearResults();
        renderLoader(elements.recipe);
        //Create new recipe object
        if(state.search){
        searchView.highlightSelected(id);}
        state.recipe = new Recipe(id);
        window.r = state.recipe;
        //Get recipe data
        try{
        await state.recipe.getRecipe();
        //claculate
      
       state.recipe.parseIngredients();
       console.log(state.recipe.ingredients);
        state.recipe.calcTime();
        state.recipe.calcServings();

        //Render Recipe
        console.log(state.recipe);
        clearLoader();
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        }catch(err){
            alert(err);
        }
    }
};

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load',controlRecipe);
['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));

//REcipe Button Clicks


const controlList = () => {

    if(!state.list) state.list = new List();

    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count,el.unit,el.ingredient);
        listView.renderItem(item);
    });

}


elements.shopping.addEventListener('click', e => {
    const id =e.target.closest('.shopping__item').dataset.itemid;

    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        state.list.deleteItem(id);
        listView.deleteItem(id);

    }
    else if(e.target.matches('.shopping__count-value')){
        console.log("IN Shopping count");
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

elements.recipe.addEventListener('click',e => {
 if(e.target.matches('.btn-decrease, .btn-decrease * '))
 {if(state.recipe.servings > 1){
state.recipe.updateServings('dec');
recipeView.updateServingsIngredients(state.recipe);
 }
 }
 else if(e.target.matches('.btn-increase, .btn-increase *')){
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
 }
 else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
     controlList();
 }
 else if(e.target.matches('.recipe__love, .recipe__love *')){
     controlLike();
 }
 console.log(state.recipe);
} );



const controlLike = () => {
    if(!state.likes) {state.likes = new Likes();}
    const currentID = state.recipe.id;
    console.log(state.recipe.id);
    if(!state.likes.isLiked(currentID)) {

            const newLike = state.likes.addLike(currentID,
                state.recipe.title,
                state.recipe.author,
                state.recipe.img
                );
    
    
            likesView.toggleLikeBtn(true);
            likesView.renderLike(newLike);

               // console.log(state.likes);

    }else {

        state.likes.deleteLike(currentID);
        likesView.toggleLikeBtn(false);
      //  console.log(state.likes);
      likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    state.likes.likes.forEach(like => likesView.renderLike(like));
});