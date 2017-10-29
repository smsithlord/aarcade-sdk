var panos = ["outset"];

function shuffleArray()
{
	var rando = Math.floor(Math.random() * panos.length);
	var front = panos.splice(0, rando);
	var shuffledArray = panos.concat(front);
	panos = shuffledArray;
}

shuffleArray();