const riceData = [
{
    id: 1,
    name: "糙米",
    image: "assets/images/rice/brown.png",
    intro: "保留米糠與胚芽，富含膳食纖維及維生素B群。"
},
{
    id: 2,
    name: "胚芽米",
    image: "assets/images/rice/germ.png",
    intro: "保留胚芽，營養較白米高。"
},
{
    id: 3,
    name: "白米",
    image: "assets/images/rice/white.png",
    intro: "最常見主食，口感細緻。"
},
{
    id: 4,
    name: "圓糯米",
    image: "assets/images/rice/sticky.png",
    intro: "適合麻糬、油飯。"
},
{
    id: 5,
    name: "黑糯米",
    image: "assets/images/rice/black.png",
    intro: "富含花青素。"
}
];

function generateCards() {

    let cards = [];

    riceData.forEach(item => {

        cards.push({
            id: item.id,
            type: "image",
            content: item.image
        });

        cards.push({
            id: item.id,
            type: "text",
            content: item.name
        });

    });

    return shuffle(cards);
}

function shuffle(arr) {

    for (let i = arr.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]];

    }

    return arr;
}