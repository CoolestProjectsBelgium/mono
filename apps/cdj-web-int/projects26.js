
function cpbeMediaTag(pic) {
    if (!pic || pic === ' ') {
        return '<img class="card-img" src=" " alt="">';
    }
    const lower = String(pic).toLowerCase();
    if (/\.(mp4|mov|webm|m4v)(\?|$)/.test(lower)) {
        return '<video class="card-img" src="' + pic + '" controls playsinline preload="metadata"></video>';
    }
    return '<img class="card-img" src="' + pic + '" alt="">';
}

addEventListener('DOMContentLoaded', async (_) => {
    const data = await getData();
    const cards = document.getElementById('cards')
    for (let card of data) {
        // console.log(card)
        const html = `
            <div class="col-sm-6 col-lg-4 mb-4">
                <div class="accordion" id="${card.projectID}-parent">
                    <div class="card">
                        <div class="accordion-item">
                            <div class="card-header accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${card.projectID}" aria-expanded="true" aria-controls="collapseOne">
                                    ${card.link ?
                `<a href="${card.link}">` :
                ''
            }
                                    <h3>${card.projectName}</h3>
                                    ${card.link ? '</a>' : ''}
                                </button>
                                <p>${card.participants}</p>
                            </div>
                            <div class="card-body">
                                <div id="${card.projectID}" class="accordion-collapse collapse" data-bs-parent="#${card.projectID}-parent">
                                    <div class="accordion-body">
                                        ${cpbeMediaTag((card.pic === undefined) ? " " : card.pic)}
                                    </div>
                                </div>
                                <p>${card.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
        cards.appendChild(createElement(html));
    }
})

/**
 *  @return {Promise}
 */
const getData = async () => {
    const data = await fetch('./data/6/projects.json')
    return await data.json()
}

/**
 * @param {String} HTML represting a single element
 * @return {Element}
 */
const createElement = (html) => {
    let template = document.createElement('template');
    // Sanitize the HTML input to prevent XSS
    template.innerHTML = DOMPurify.sanitize(html);
    return template.content;
}

/**
 * @param {String} inputString the name of the id
 * @return {String} trimmed string for use as identifier in css and html
 */
const trimId = (inputString) => {
    
    // if input is null, undefined, return an empty string
    if ( !inputString ) {
        return '';
    }
    inputString = String(inputString); // Ensure the input is treated as a string
    const res = inputString
        .trim()
        .replaceAll(' ', '')
        .replaceAll('\'', '')
        .replaceAll(':', '')
        .replaceAll('!', '')
        .replaceAll('?', '')
        .replaceAll('"', '');
    return res;
}
