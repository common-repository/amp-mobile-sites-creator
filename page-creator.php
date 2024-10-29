<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>

<div class="plugin-wrap">
    <h1>AMP Mobile Sites Creator<br/>Hosting and AMP CMS Sign-up</h1>
    <!--<h4>Paid hosting and CMS access fee starting at $79 a month</h4>-->

    <a class="logo" href="https://www.fastampsites.com/" target="_blank">
        <img src="<?=plugin_dir_url(__FILE__)?>img/logo.png"/>
    </a>

    <h4 class="pages-list-title">The pages are not yet exported</h4>
    <h4 class="pages-list-title">The pages already exported</h4>

    <div class="pages-list pages-list-left">
        <div class="button-panel">
            <button class="button action select-all-pages">Select All</button>
            <button class="button action deselect-all-pages">Deselect All</button>
        </div>
    </div>

    <div class="pages-list pages-list-right">
        <div class="button-panel">
            <button class="button action select-all-pages">Select All</button>
            <button class="button action deselect-all-pages">Deselect All</button>
        </div>
    </div>

    <div class="clear-both"></div>

    <div class="button-row">
        <button id="action-enter-account" type="button" class="button action" style="display: none;">Login to FastAMPsites</button>
        <button id="action-export" data-type="export" type="button" class="button action" style="display: none;">Export Page(s)</button>

        <a id="action-open-project" href="https://www.fastampsites.com/#/builder/<?=$project_name?>" target="_blank" style="display: none;" class="button action">Open Project</a>

        <button id="action-create-account" type="button" class="button action" style="display: none;">Create new Account</button>
        <button id="action-merge" data-type="merge" type="button" class="button action" style="display: none;">Merge page(s)</button>
        <button id="action-update" data-type="update" type="button" class="button action" style="display: none;">Update page(s)</button>
    </div>

    <div class="button-row">
        <button id="action-credentials" type="button" class="button action" style="display: none;">Credentials</button>
        <button id="action-logout" type="button" class="button action" style="display: none;">Logout</button>
        <div class="use-amp-block">
            <label for="used_amp">Add the AMP link in the head of the site</label>
            <input type="checkbox" id="used_amp" <?=($used_amp == 'true' ? 'checked' : '')?>>
        </div>
    </div>
</div>

<div id="modal-account" class="modal">
    <div class="modal-content-wrap">
        <h3>Create New Account</h3>
        <div class="row">
            <label>Email:</label>
            <input type="email" name="email"/>
        </div>
        <div class="row">
            <label>Password:</label>
            <input type="password" name="password"/>
        </div>
        <div class="row">
            <button id="modal-account-enter" type="button" class="button action">Create</button>
            <button id="modal-account-close" type="button" class="button action">Close</button>
        </div>
        <p class="form-result"></p>
    </div>
</div>

<div id="modal-export" class="modal">
    <div class="modal-content-wrap">
        <h3>Please wait...</h3>
        <div class="progress-bar">
            <div style="height:30px;width:0%">
                <span>0%</span>
            </div>
        </div>
        <button id="progress-stop" type="button" class="button action">Cancel</button>
        <p class="form-result"></p>
    </div>
</div>

<div id="modal-credentials" class="modal">
    <div class="modal-content-wrap">
        <h3>Credentials</h3>
        <div class="row">
            <label>First name:</label>
            <input type="text" name="first_name" disabled/>
        </div>
        <div class="row">
            <label>Last name:</label>
            <input type="text" name="last_name" disabled/>
        </div>
        <div class="row">
            <label>Country:</label>
            <input type="text" name="country" disabled/>
        </div>
        <div class="row">
            <label>City:</label>
            <input type="text" name="city" disabled/>
        </div>
        <div class="row">
            <label>State:</label>
            <input type="text" name="state" disabled/>
        </div>
        <div class="row">
            <label>Zip:</label>
            <input type="text" name="zip" disabled/>
        </div>
        <div class="row">
            <label>Company:</label>
            <input type="text" name="company" disabled/>
        </div>
        <div class="row">
            <label>Contact number:</label>
            <input type="text" name="contact_number" disabled/>
        </div>
        <div class="row">
            <button id="action-save-credentials" type="button" class="button action" disabled>Save</button>
            <button id="action-close-credentials" type="button" class="button action">Close</button>
        </div>
        <p class="form-result"></p>
    </div>
</div>

<div id="modal-update" class="modal">
    <div class="modal-content-wrap">
        <button id="btn-close-model-update" type="button" class="button action">Close</button>
        <h3>Version Control</h3>
    </div>
</div>

