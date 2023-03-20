<script lang="ts">

</script>


<div class="card">
    <div class="helper-wrapper">
        <p>Aplikacja służy do analizy raportów wygenerowanych przez
            <mark>Analizator Kwantowy w wersji 4.7.0</mark>
        </p>
        <p>
            Aby przygotować raporty do analizy wejdź do Analizatora Kwantowego, wczytaj każdy z raportów,
            który chcesz analizować i w każdym kliknij przycisk
            <mark>Zapisz raport (HTML)</mark>
            .
            Wybierz unikalną nazwę dla każdego z raportów i zapisz je w tym samym katalogu.
            Dobrym pomysłem na unikalną nazwę jest dodanie do niej daty i godziny wygenerowania raportu, np:
            <mark>Sprawozdanie z badan20230312.0751.htm</mark>
            .
        </p>
        <p>
            Następnie w Analizatorze kliknij przycisk
            <mark>Otwórz katalog z raportami</mark>
            i wybierz katalog, w którym znajdują się raporty:<br/><br/>
            <img alt="Wybór katalogu z raportami" src="./images/folder_select.png"/><br/><br/>
            Po wybraniu katalogu potwierdź dostęp aplikacji do plików:<br/><br/>
            <img alt="Potwiedzenie dostępu" src="./images/confirm_access.png"/><br/><br/>
            Po wczytaniu aplikacja jest gotowa do przeglądania danych.
        </p>
    </div>
</div>

<div class="card">
    <div class="helper-wrapper">
        Aplikacja nie zapisuje żadnych danych. Wszystkie dane są przechowywane w pamięci
        Twojej przeglądarki, ładowane na bieżąco i usunięte przy zamknięciu okna.
        Aplikacja nie wysyła żadnych danych do serwera.
    </div>
</div>

<div class="card">
    <div class="helper-wrapper">
        Proszę zgłaszać wszelkie problemy na stronie
        <a href="https://github.com/KAStats/KAStats/issues"
           rel="noreferrer" target="_blank">https://github.com/KAStats/KAStats/issues</a>
    </div>
</div>

<style>
    .helper-wrapper {
        text-align: left;
        padding: 0 3rem;
    }

    img {
        border: 2px solid var(--element-border-color);
    }
</style>
