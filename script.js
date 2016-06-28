window.onload = function() {
    document.getElementById('id_btnok').onclick = function() {
    
        var text = document.getElementById('id_text').value;
        var wordBreak = document.getElementById('id_chb').checked;
        var constraint = parseInt(document.getElementById('id_cons').value, 10);
        
        var result = document.getElementById('id_result');
        result.innerText = result.textContent = getNormalString(text, constraint, wordBreak);
    };
};