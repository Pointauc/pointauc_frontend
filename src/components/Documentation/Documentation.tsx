import React, { FC } from 'react';
import Marble from '../../assets/img/pradenW.png';
import Eblan from '../../assets/img/eblan.png';
import './Documentation.scss';

const Documentation: FC = () => {
  return (
    <div className="documentation">
      <h2 id="motivation">Мотивация создания аукциона</h2>
      <div>
        Большая проблема обычных аукционов в том, что стримеру приходится тратить все свое внимание на долгий ручной
        ввод ставок и постоянную сверку с donation alerts. К тому же стример может что-то пропустить и потом приходится
        вспоминать, что же он там вводил, или искать клипы.
      </div>
      <div>
        Большинство таких проблем решает данный аук. Таким образом стример может как можно меньше времени тратить на
        чисто технические моменты, меньше душиться и больше времени взаимодействовать с аудиторией.
      </div>
      <div>
        Также я стараюсь добавлять какие-то технические нововведения, которые могут разнообразить проведение аукциона
      </div>
      <h2 id="main-feature">Основная фича аукциона</h2>
      <div>Включение какой-либо интеграции добавляет множество новых фич:</div>
      <ol>
        <li>
          Все новые ставки отображаются в виде карточек под таймером
          <ul>
            <li>Карточки можно перетаскивать прямо на лот, чтобы добавить сумму к его стоимости</li>
            <li>На карточке есть кнопка &quot;новый&quot;, чтобы быстро создать новый лот</li>
            <li>
              <div>
                {
                  'На карточке может появиться кнопка "к <название лота>", если есть лот, название которого совпадает с названием ставки >60%. Нажав на кнопку ставка сразу добавится к этому лоту'
                }
              </div>
              <div>
                Поиск по частичному совпадению производится только в момент появления карточки в целях оптимизации
              </div>
            </li>
          </ul>
        </li>
        <li>
          Если название ставки полностью совпадает с названием лота, то ставка добавится автоматически. (также
          запоминаются названия всех ставок, которые были добавлены в один лот)
        </li>
        <li>
          {
            'Можно делать ставки указав просто короткий номер лота "#<ключ>", который указан рядом с позицией лота. Это гораздо быстрее и автоматически добавит ставку к лоту.'
          }
        </li>
      </ol>
      <h2 id="point-auc">Поинтовый аукцион</h2>
      <div>На странице интеграции вы можете настроить список наград.</div>
      <div>
        При нажатии на кнопку &quot;Включить награды&quot; на канале АВТОМАТИЧЕСКИ создаются награды из списка. После
        этого кнопка заменяется на &quot;Скрыть награды&quot;, которая собственно скрывает награды для зрителя, но они
        все еще остаются на канале и их можно вернуть.
      </div>
      <div>При нажатии на &quot;Удалить награды&quot; награды полностью удаляются с канала</div>
      <div style={{ color: '#ff6868' }}>
        Награды можно будет вернуть на вкладке История, либо в дашборде твича, НО ТОЛЬКО ПОКА ВЫ ИХ НЕ УДАЛИТЕ.
        <br />
        ПРОШЛЫЕ НАГРАДЫ УДАЛЯЮТСЯ ПРИ ИХ ИЗМЕНЕНИИ.
      </div>
      <h2 id="donate-auc">Донатный аукцион</h2>
      <h2 id="marbles-auc">Шаровой аукцион</h2>
      <h2 id="wheel">Колесо</h2>
      <h2 id="statistic">Статистика</h2>
      <h2 id="history">История</h2>
      <h2 id="sponsors">Спонсоры</h2>
      <div className="sponsor tier-1">UselessMouth</div>
      <div className="sponsor tier-2">MistaFaker</div>
      <div className="sponsor tier-2">Shizov</div>
      <div className="sponsor tier-2" style={{ display: 'flex', alignItems: 'center' }}>
        <span>Archiedos</span>
        <img src={Eblan} alt="шар" width={25} height={25} style={{ marginLeft: 5, marginRight: 5 }} />
      </div>
      <div className="sponsor tier-2">Slexboy</div>
      <div className="sponsor tier-3" style={{ display: 'flex', alignItems: 'center' }}>
        <span>Pradenw</span>
        <img src={Marble} alt="шар" width={25} height={25} style={{ marginLeft: 5, marginRight: 5 }} />
      </div>
      <div className="sponsor tier-3">Adash</div>
      <div className="sponsor tier-3">Gedo</div>
      <div className="sponsor tier-3">Никита</div>
      <div className="sponsor tier-4">фанибон</div>
      <div className="sponsor tier-4">ndrusha</div>
      <div className="sponsor tier-4">SlowLadin</div>
      <div className="sponsor tier-5">kebab boi</div>
      <div className="sponsor tier-5">Han_Soda</div>
      <div className="sponsor tier-5">cabbakid</div>
      <div className="sponsor tier-5">danzer</div>
      <div className="sponsor tier-5">KejVan</div>
      <h2 id="contacts">Мои контакты</h2>
      <ul>
        <li>Discord — kozjar#4193</li>
        <li>Telegram — @Cougho</li>
        <li>Twitch — kozjar</li>
      </ul>
    </div>
  );
};

export default Documentation;
