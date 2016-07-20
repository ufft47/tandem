import Entity from 'saffron-common/lib/entities/entity';
import { FactoryFragment } from 'saffron-common/lib/fragments/index';
import FragmentSection from 'saffron-common/lib/section/fragment';
import NodeSection from 'saffron-common/lb/select/node';

export default class GroupEntity extends Entity {

  public section:FragmentSection|NodeSelector;

  async load(options) {
    this.section = FragmentSection.create();
    for (var childExpression of this.expression.childNodes) {
      await this.appendChild(await childExpression.load(Object.assign({}, options, {
        section: this.section
      })));
    }
  }

  async update(options) {

    var childNodes = this.childNodes.concat();

    for (var i = 0, n = this.expression.childNodes.length; i < n; i++) {
      var cexpr = this.expression.childNodes[i];
      if (i < this.childNodes.length) {

        var child = childNodes.find(({ expression }) => (
          expression === cexpr
        ));

        if (child) {
          await child.update(options);

          if (child !== this.childNodes[i]) {
            // re-order
            this.insertBefore(child, this.childNodes[i]);
          }
        } else {
          var replChild = await cexpr.load({
            ...options,
            section: this.section
          });
          var oldChild = this.childNodes[i];
          this.insertBefore(replChild, oldChild);
          this.removeChild(oldChild);
        }
      } else {
        await this.appendChild(await cexpr.load({
          ...options,
          section: this.section
        }));
      }
    }
  }

  willUnmount() {
    this.section.remove();
  }
}

export const fragment = new FactoryFragment({
  ns: 'entities/group',
  factory: GroupEntity,
});