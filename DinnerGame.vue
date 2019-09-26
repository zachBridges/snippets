<template>
    <div>
        <template v-if="isGameReadyToDisplay">
            <ChooseIngredient 
                :copydeckAPIBase="copydeckAPIBase"
                :recipeContent="recipeContent"
                v-on:recipeCategorySelected="onRecipeSelected"
                v-if="isRecipesLoaded && isChooseIngredient"
            />
            <RecipeDisplay 
                :recipe="randomRecipe"
                :recipeContent="recipeContent"
                :dippingSauceContent="dippingSauceContent"
                :isGameLimited="isGameLimited"
                v-if="isDisplayRecipe"
                v-on:resetGame="onResetGame"
            />
        </template>
        <template v-else>
            <LoadingAnimation/>
        </template>
    </div>
</template>

<script>
    import axios from 'axios';
    import ChooseIngredient from './ChooseIngredient.vue';
    import LoadingAnimation from './LoadingAnimation.vue';
    import RecipeDisplay from './RecipeDisplay.vue'

    export default {
        data() {
            return {
                copydeckAPIBase: '',
                dippingSauceContent: {},
                isChooseIngredient: true,
                isGameReadyToDisplay: false,
                isDisplayRecipe: false,
                isGameLimited: false,
                isRecipesLoaded: false,
                randomRecipe: {},
                recipeContent: null,
                recipesLoaded: false,
            }
        },
        components: {
            ChooseIngredient, 
            LoadingAnimation,
            RecipeDisplay,
        },
        async mounted () {
            this.setAPIBase();
            await this.getRecipeContent();
            this.isRecipesLoaded = true;
            // * hw.is_limited declared in _head.tt2
            this.isGameLimited = hw.is_limited;
        },
        updated() {
            // * after every updated hook, update the iframe height
            window.hw.pymChild.sendHeight();
        },
        methods: {
            async getRecipeContent() {
                const currentPhase = hw.current_phase;
                const whichPhase = currentPhase.indexOf('2') > -1 ? 'phase_2' : 'phase_1';
                const whichFile = `en.recipes_${whichPhase}.json`;
                const { data } = await axios.get(`${this.copydeckAPIBase}${whichFile}`);
                this.recipeContent = this.removeDots(data.result);
                this.dippingSauceContent = this.removeDots(data.result['dipping_sauce']);
                this.showGame();
            },
            getRandomRecipeViaCategory(category){
                /*
                * ex., this.recipeContent.recipes.chicken.grilled_chicken
                */ 
                const getRandomInt = (maxBound) => {
                    return Math.floor(Math.random() * Math.floor(maxBound));
                }
                const numberAvailableRecipes = Object.keys(this.recipeContent['recipes'][category]).length; 
                const randomRecipeIndex = getRandomInt(numberAvailableRecipes);
                const chosenCategory = this.recipeContent['recipes'][category];
                const randomRecipeByCategory = Object.keys(chosenCategory)[randomRecipeIndex];
                const randomRecipeObject = this.recipeContent['recipes'][category][randomRecipeByCategory];
                return randomRecipeObject;
            },
            onRecipeSelected(category) {
                // * toLowerCase and remove spaces and replace with dash
                const normalizedCategory = category.toLowerCase().replace(' ', '_');
                
                this.isChooseIngredient = false;
                this.randomRecipe = this.getRandomRecipeViaCategory(normalizedCategory);
                this.isDisplayRecipe = true;
            },
            onResetGame() {
                this.isDisplayRecipe = false;
                this.isChooseIngredient = true;
            },
            removeDots (cdObj) {
                if (typeof cdObj !== 'object') {
                    return cdObj;
                }
                Object.keys(cdObj).forEach((key)=>{
                    if (key[0] === '.') {
                        delete cdObj[key];
                    }
                    else if (typeof cdObj[key] === 'object') {
                        this.removeDots(cdObj[key]);
                    }
                });
                return cdObj;
            },
            setAPIBase(){
                // * hw.site_url, etc, declared in _head.tt2
                const siteURL = hw.site_url;
                const apiBase = hw.site_url_base_path;
                this.copydeckAPIBase = `/v1${apiBase}copydeck/`;
            },
            showGame() {
                //hide loading animation, show game
                this.isGameReadyToDisplay = true;
            }
        },
    }
</script>