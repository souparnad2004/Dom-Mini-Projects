const addBtn = document.getElementById('add-btn');
const input = document.getElementById('item-input');

addBtn.addEventListener('click', () => {
    if(input.value === "") return;

    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = input.value
    li.append(span);

    const buttons = document.createElement('div');
    li.append(buttons);

    const editBtn = document.createElement('button');
    editBtn.classList.add('edit');
    editBtn.textContent = "Edit"
    buttons.append(editBtn);

    editBtn.addEventListener('click', () => {
        const editBox = document.createElement('input');
        editBox.classList.add('editInput');

        editBox.value = span.textContent;
        span.textContent = "";

        editBtn.style.display = "none";
        deleteBtn.style.display = "none";

        li.prepend(editBox);
        const updateBtn = document.createElement('button');
        updateBtn.textContent = "Update";
        updateBtn.classList.add('update')
        li.append(updateBtn);

        updateBtn.addEventListener('click',() => {
            span.textContent = editBox.value;
            editBox.remove();
            updateBtn.remove();

        editBtn.style.display = "inline";
        deleteBtn.style.display = "inline";
        })
    })

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete')
    deleteBtn.textContent = "Delete"
    buttons.append(deleteBtn)

    deleteBtn.addEventListener('click', () => {
        li.remove();
    })
    
    document.getElementById('item-list').append(li);  
    input.value = "";  
})