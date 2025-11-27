document.addEventListener('DOMContentLoaded', () => {
    // 1. Selecionar elementos do DOM
    const searchButton = document.getElementById('search-button');
    const pokemonInput = document.getElementById('pokemon-input');
    const pokemonInfoDiv = document.getElementById('pokemon-info');
    
    // Elementos de LISTA e HISTÓRICO
    const historyListDiv = document.getElementById('history-list');
    const pokemonListDiv = document.getElementById('pokemon-list');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    // Variáveis de Estado
    const searchHistory = [];
    let offset = 0; 
    const limit = 150; 

    
    const pokemonTypes = {
        'normal': { color: '#A8A77A', text: '#212121' },
        'fire': { color: '#EE8130', text: 'white' },
        'water': { color: '#6390F0', text: 'white' },
        'electric': { color: '#F7D02C', text: '#212121' },
        'grass': { color: '#7AC74C', text: '#212121' },
        'ice': { color: '#96D9D6', text: '#212121' },
        'fighting': { color: '#C22E28', text: 'white' },
        'poison': { color: '#A33EA1', text: 'white' },
        'ground': { color: '#E2BF65', text: '#212121' },
        'flying': { color: '#A98FF3', text: '#212121' },
        'psychic': { color: '#F95587', text: 'white' },
        'bug': { color: '#A6B91A'},
        'rock': { color: '#B6A136'},
        'ghost': { color: '#735797'},
        'dragon': { color: '#6F35FC'},
        'steel': { color: '#B7B7CE'},
        'fairy': { color: '#D685AD'},
        'dark': { color: '#705746'}
    };


    searchButton.addEventListener('click', () => {
        const pokemonNameOrId = pokemonInput.value.toLowerCase().trim();
        if (pokemonNameOrId) {
            fetchPokemon(pokemonNameOrId);
        } else {
            pokemonInfoDiv.innerHTML = '<p>Por favor, digite o nome ou ID do Pokémon.</p>';
        }
    });
    

    historyListDiv.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            event.preventDefault(); 
            const pokemonName = event.target.textContent;
            fetchPokemon(pokemonName.toLowerCase());
        }
    });


    function formatTypes(typesArray) {
        return typesArray
            .map(typeInfo => typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)) 
            .join(', ');
    }

   
    async function fetchPokemon(query) {
        pokemonInfoDiv.innerHTML = '<p>Carregando...</p>';
        
        try {
            const apiUrl = `https://pokeapi.co/api/v2/pokemon/${query}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error('Pokémon não encontrado!');
            }
            
            const data = await response.json();
            
          
            const pokemonName = data.name.charAt(0).toUpperCase() + data.name.slice(1);
            if (!searchHistory.some(p => p.toLowerCase() === pokemonName.toLowerCase())) {
                searchHistory.unshift(pokemonName); 
            }
            
            displayHistory();
            displayPokemon(data);

        } catch (error) {
            console.error('Erro ao buscar Pokémon:', error);
            pokemonInfoDiv.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
        }
    }


    function displayPokemon(pokemon) {
        const types = formatTypes(pokemon.types);
        const primaryType = pokemon.types[0].type.name;
        
  
        pokemonInfoDiv.className = 'pokemon-card'; 
        pokemonInfoDiv.classList.add(`${primaryType}-type`); 


        const MAX_STAT_VALUE = 255; 

        const statsHtml = pokemon.stats.map(stat => {
            const statName = stat.stat.name.toUpperCase().replace('-', ' '); 
            const baseStat = stat.base_stat;
            const percentage = Math.min((baseStat / MAX_STAT_VALUE) * 100, 100); 

            return `
                <div class="stat-bar-container">
                    <span class="stat-name">${statName}:</span>
                    <div class="bar-background">
                        <div class="bar-fill" style="width: ${percentage}%;"></div>
                        <span class="stat-value">${baseStat}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        const htmlContent = `
            <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} (#${pokemon.id})</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
            <p><strong>Tipo(s):</strong> ${types}</p>
            <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
            <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
            
            <br>
            <h3>Estatísticas Base</h3>
            ${statsHtml} `;
        
        pokemonInfoDiv.innerHTML = htmlContent;
    }

    
    // 1--- HISTÓRICO
    function displayHistory() {
        if (searchHistory.length === 0) {
            historyListDiv.innerHTML = '<p>Nenhum pokémon foi capturado.</p>';
            return;
        }
        const ul = document.createElement('ul');
        searchHistory.forEach(pokemonName => {
            const li = document.createElement('li');  
            const link = document.createElement('a');
            link.href = "#"; 
            link.textContent = pokemonName;  
            li.appendChild(link);
            ul.appendChild(li);
        });
        
        historyListDiv.innerHTML = '';
        historyListDiv.appendChild(ul);
    }
    displayHistory();
   
    // 2--- LISTA
    async function fetchPokemonList(currentOffset = 0) {
        try {
            const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${currentOffset}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error('Não foi possível carregar a lista de Pokémon.');
            }
            const data = await response.json();
            const detailedPokemonPromises = data.results.map(p => fetch(p.url).then(res => res.json()));
            const detailedPokemonData = await Promise.all(detailedPokemonPromises);

            displayPokemonList(detailedPokemonData); 
            if (!data.next) {
                 loadMoreBtn.style.display = 'none';
            }
        } catch (error) {
             console.error('Erro ao carregar a lista de Pokémon:', error);
             pokemonListDiv.innerHTML = '<p style="color: red;">Erro ao carregar a lista. Tente novamente.</p>';
        }
    }

 
    function displayPokemonList(pokemonArray) {
        pokemonArray.forEach(pokemon => { 
            const card = document.createElement('div');
            card.classList.add('pokemon-card'); 

         
            const primaryType = pokemon.types[0].type.name;
            
            
            
            const id = pokemon.id;
            const types = formatTypes(pokemon.types); 

      
            card.innerHTML = `
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" width="96" height="96">
                <p style="color: #666; font-size: 0.9em;">#${id}</p>
                <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                <p><strong>Tipo(s):</strong> ${types}</p> 
            `;
            card.addEventListener('click', () => {
                fetchPokemon(pokemon.name);
            });
            pokemonListDiv.appendChild(card); 
        });
    }
    loadMoreBtn.addEventListener('click', () => {
        offset += limit; 
        fetchPokemonList(offset);
    });

    fetchPokemonList(offset);
});