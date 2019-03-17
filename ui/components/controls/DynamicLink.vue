<script>
import dataent from 'dataentjs';
import Link from './Link';

export default {
    extends: Link,
    inject: ['dynamicLinkTarget'],
    methods: {
        getTarget() {
            return this.dynamicLinkTarget(this.docfield.references);
        }
    }
}
</script>
