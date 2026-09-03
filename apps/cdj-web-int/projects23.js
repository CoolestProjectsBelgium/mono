
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
    data = await getData();
    const cards = document.getElementById('cards')
    for (let card of data) {
        console.log(card)
        const html = `
            <div class="col-sm-6 col-lg-4 mb-4">
                <div class="accordion" id="${trimId(card.projectName)}-parent">
                    <div class="card">
                        <div class="accordion-item">
                            <div class="card-header accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${trimId(card.projectName)}" aria-expanded="true" aria-controls="collapseOne">
                                    ${card.link ? `<a href="${card.link}">` : ''}
                                    <h3>${card.projectName}</h3>
                                    ${card.link ? '</a>' : ''}
                                </button>
                                <p>${card.participants}</p>
                            </div>
                            <div class="card-body">
                                <div id="${trimId(card.projectName)}" class="accordion-collapse collapse" data-bs-parent="${trimId(card.projectName)}-parent">
                                    <div class="accordion-body">
                                        ${cpbeMediaTag(card.pic)}
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
    const data = await fetch('./data/3/projects.json')
    return await data.json()
}

/**
 * @param {String} HTML represting a single element
 * @return {Element}
 */
const createElement = (html) => {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
}

/**
 * @param {String} string the name of the id
 * @return {String} trimmed string
 */
const trimId = (string) => {
    const res = string.trim().replaceAll(' ', '').replace(/[()\d]+/g, '');
    return res;
}
