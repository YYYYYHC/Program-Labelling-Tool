# To use the tool

1. Set up local environment following https://threejs.org/docs/#manual/en/introduction/Installation

2. Under the labeling_tool directory, start the web server.

   ```shell
   npx vite
   ```

3. Visit the provided link.

4. Select files.

5. Menu:

   - left click = select area
   - right click = select label
   - left arrow = previous file
   - right arrow = next file
   - q = save the current file

# Notice

- to label different categories, modify the HTML and js as following:

  1. In html, modify options. For a category with two labels, it should be like

     ```html
     <div id="customContextMenu" style="display:none; position: absolute; z-index: 1000; ">
                 <ul>
                     <li id="option1">leg</li>
                     <li id="option2">top</li>
     
                 </ul>
     </div>
     ```

  2. In js, modify accordingly

     ```javascript
     document.getElementById('option1.addEventListener('click', function() {
         const uniqueGtLabels = [...new Set(gtLabels)];        
         const GTLABELid = uniqueGtLabels.indexOf('leg');
         previous_selected_obj.material.color.set(COLORS4[GTLABELid]);
         console.log(previous_selected_obj.userData);
         previous_selected_obj.userData.label = 'leg';
         code_to_save  = modifyNthGTLabel(code_to_save,parseInt(previous_selected_obj.userData.id,10),'leg')
         console.log(code_to_save)
         previous_selected_obj = null;
         previous_selected_color = null;
         contextMenu.style.display = 'none';  
     });
     
     document.getElementById('option2').addEventListener('click', function() {
         const uniqueGtLabels = [...new Set(gtLabels)];        
         const GTLABELid = uniqueGtLabels.indexOf('top');
         previous_selected_obj.material.color.set(COLORS4[GTLABELid]);
         previous_selected_obj.userData.label = 'top';
         code_to_save = modifyNthGTLabel(code_to_save,parseInt(previous_selected_obj.userData.id,10),'top')
         console.log(code_to_save)
         previous_selected_obj = null;
         previous_selected_color = null;
         contextMenu.style.display = 'none';
     })
     ```

- After pressing 'q', the modified file will be saved to the default download directory of your browser. Change the default directory accordingly.